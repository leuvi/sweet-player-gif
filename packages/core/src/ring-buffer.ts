export class RingBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private count = 0

  constructor(private capacity: number) {
    this.buffer = new Array(capacity)
  }

  push(item: T): void {
    this.buffer[this.head] = item
    this.head = (this.head + 1) % this.capacity
    if (this.count < this.capacity) this.count++
  }

  drain(): T[] {
    if (this.count === 0) return []

    const result: T[] = []
    const start = (this.head - this.count + this.capacity) % this.capacity
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(start + i) % this.capacity] as T)
    }

    this.clear()
    return result
  }

  clear(): void {
    this.buffer = new Array(this.capacity)
    this.head = 0
    this.count = 0
  }

  get size(): number {
    return this.count
  }
}
