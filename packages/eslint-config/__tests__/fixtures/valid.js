const foo = 1;
const bar = 'hello';

function capture() {
  const self = this;

  return self;
}

export { foo, bar, capture };
