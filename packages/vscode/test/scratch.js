
function foo() {
  var foo = 'bar';
}

let myMachine = machine`
  ref foo = ${() => 'a'}

  guard check = ${() => true}

  initial state start {
    => check => done
  }

  final state done => {

  }
`;

async function test() {
  if(foo()) {
    const boo = () => {

    };
  }
}