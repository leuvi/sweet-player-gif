use color_quant::NeuQuant;
use gif::{Encoder, Frame, Repeat};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn encode_gif(
    frames_data: &[u8],
    width: u32,
    height: u32,
    frame_count: u32,
    delay: u16,
    quality: u8,
) -> Vec<u8> {
    let w = width as u16;
    let h = height as u16;
    let frame_size = (width * height * 4) as usize;
    let sample_factor = (quality as i32).clamp(1, 30);

    let mut buf: Vec<u8> = Vec::new();

    {
        let mut encoder = Encoder::new(&mut buf, w, h, &[]).unwrap();
        encoder.set_repeat(Repeat::Infinite).unwrap();

        for i in 0..frame_count as usize {
            let start = i * frame_size;
            let end = start + frame_size;
            if end > frames_data.len() {
                break;
            }

            let rgba = &frames_data[start..end];
            let nq = NeuQuant::new(sample_factor, 256, rgba);

            let palette = nq.color_map_rgb();
            let mut indices = Vec::with_capacity((width * height) as usize);
            for pixel in rgba.chunks_exact(4) {
                indices.push(nq.index_of(pixel) as u8);
            }

            let mut frame = Frame::default();
            frame.width = w;
            frame.height = h;
            frame.delay = delay;
            frame.palette = Some(palette);
            frame.buffer = std::borrow::Cow::Borrowed(&indices);

            encoder.write_frame(&frame).unwrap();
        }
    }

    buf
}
