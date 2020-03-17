class _Node {
    constructor(value = null, next = null) {
        this.value = value;
        this.next = next;
    }
}
class LinkedList {
  constructor() {
    this.head = null;
  }
  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }
  insertBefore(item, desiredNode, list) {
    //traverse head until find currentNode
    //set next of item to currentNode
    //tempNode = node before currentNode
    if (desiredNode === list.head.value) {
      this.insertFirst(item);
      return;
    }
    let current = list.head;
    let previous = list.head;

    while (current !== null && current.next.value != desiredNode) {
      previous = current; //old
      current = current.next; //looping if not equal
    }
    current.next = new _Node(item, current.next);
  }

  insertAfter(item, desiredNode, list) {
        if (list.head === null) {
            this.insertFirst(item)
        }      
        let current = list.head
        let previous = list.head
        while (current.value !== desiredNode) {
           console.log('this is current', current)
           previous = current;
           current = current.next; 
        }
        current.next = new _Node(item, current.next)
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
      return;
    }
    let tempNode = this.head;
    while (tempNode !== null) {
      if (tempNode.next === null) {
        return null;
      }
      tempNode = tempNode.next;
    }
    tempNode.next = new _Node(item, null);
  }
  insertAt(item, list, desiredPosition) {
        if (list.head === null) {
            this.insertFirst(item)
        }

        let position = 1;
        let tempNode = list.head
        while(desiredPosition !== position) {
            tempNode = tempNode.next
            position++
        }
        this.insertBefore(item, tempNode.value, list)
  }
  find(item) {
    let currNode = this.head;
    if (!this.head) {
      return null;
    }
    while (currNode.value !== item) {
      if (currNode.next === null) {
        return null;
      } else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }
  remove(item) {
    if (!this.head) {
      return null;
    }
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head;
    let previousNode = this.head;
    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log("Item not found");
      return;
    }
    previousNode.next = currNode.next;
  }
}

module.exports=LinkedList