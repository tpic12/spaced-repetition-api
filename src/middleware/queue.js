class _Node {
  constructor(data, next) {
    this.data = data;
    this.next = next;
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null; 
  }

  enqueue(data) {
    if(this.first === null){
      const node = new _Node(data, null);
      this.first = node;
      this.last = node;
      return node;
    }
    let temp = this.last;
    const node = new _Node(data, null);
    temp.next = node;
    this.last = node;
    return node;
  }

  dequeue() {
    if(this.first === null) {
      return;
    }
    let temp = this.first;
    this.first = this.first.next;
    if(temp === this.last) {
      this.last = null;
    }
    return temp.data;
  }


  show() {
    if (!this.first) {
      return;
    }
    return this.first.data;
  }

  all() {
    let QCopy = this.first;
    let queue = [];
    if (!this.first) {
      return;
    }
    while(this.first.next !== null) {
      queue.push(this.first.data);
      this.first = this.first.next;
    }
    queue.push(this.first.data);
    this.first = QCopy;
    return queue;
  
  }
}

module.exports = Queue