class EventedArray {
  constructor(handler = new Function) {
    this.stack = []
    this.mutationHandler = handler
  }

  setHandler(handler) {
    this.mutationHandler = handler
  }

  callHandler() {
    this.mutationHandler()
  }

  push(obj) {
    this.stack.push(obj)
    this.callHandler()
  }

  pop() {
    return this.stack.pop()
  }

  getArray() {
    return this.stack
  }

  clearArray() {
    return this.stack = []
  }
}

module.exports = EventedArray
