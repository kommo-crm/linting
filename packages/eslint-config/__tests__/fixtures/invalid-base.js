var foo = 1;
if (foo == 1) alert(foo);
const x = { y: 1 };

switch (foo) {
  case 1:
    break;
}

function capture() {
  const that = this;

  return that;
}

function pick(value) {
  switch (value) {
    default:
      return 0;
    case 1:
      return 1;
  }
}

export { foo, x, capture, pick };

export default foo;
