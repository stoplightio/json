import { decycle } from '../decycle';

describe('decycle', () => {
  it('should not decycle simple types', () => {
    expect(decycle(true)).toEqual(true);
    expect(decycle('bear')).toEqual('bear');
    expect(decycle(1)).toEqual(1);
  });

  it('should remove circular javascript objects and replace them with a json ref', () => {
    const obj = {
      foo: 'bar',
      circular: {},
      nested: {
        cave: {
          circular: {},
        },
      },
      bears: {
        type: 'awesome',
        height: 'tall',
        grouchy: 'always',
      },
    };

    obj.nested.cave.circular = obj;
    obj.circular = obj;

    expect(decycle(obj)).toEqual({
      foo: 'bar',
      circular: {
        $ref: '#',
      },
      nested: {
        cave: {
          circular: {
            $ref: '#',
          },
        },
      },
      bears: {
        type: 'awesome',
        height: 'tall',
        grouchy: 'always',
      },
    });
  });

  it('should remove circular javascript for multiple objects objects and replace them with a json ref', () => {
    const obj = {
      foo: 'bar',
      obj2: {},
    };

    const obj2 = {
      bar: 'foo',
      nested: {
        self: {},
      },
    };

    obj.obj2 = obj2;
    obj2.nested.self = obj2;

    expect(decycle(obj)).toEqual({
      foo: 'bar',
      obj2: {
        bar: 'foo',
        nested: {
          self: {
            $ref: '#/obj2',
          },
        },
      },
    });
  });

  it('should properly encode pointers when decycling a json object', () => {
    const obj2 = {
      circle: {},
    };
    obj2.circle = obj2;

    const obj = {
      paths: {
        '/circle/foo': {
          obj2: {},
        },
      },
    };
    obj.paths['/circle/foo'].obj2 = obj2;

    expect(decycle(obj)).toEqual({
      paths: {
        '/circle/foo': {
          obj2: {
            circle: {
              $ref: '#/paths/~1circle~1foo/obj2',
            },
          },
        },
      },
    });
  });

  it('should not create refs for objects that are not circular', () => {
    const obj2 = {
      circle: {},
    };
    obj2.circle = obj2;

    const obj3 = {
      foo: 'bar',
    };

    const obj = {
      obj3A: obj3,
      obj3B: obj3,
      paths: {
        '/circle': {
          obj2: {},
        },
      },
    };
    obj.paths['/circle'].obj2 = obj2;

    expect(decycle(obj)).toEqual({
      obj3A: {
        foo: 'bar',
      },
      obj3B: {
        foo: 'bar',
      },
      paths: {
        '/circle': {
          obj2: {
            circle: {
              $ref: '#/paths/~1circle/obj2',
            },
          },
        },
      },
    });
  });
});
