import { traverse } from '../traverse';

describe('traverse', () => {
  it('should call function', () => {
    const obj = {
      foo: {
        bar: 'bear',
      },
    };

    const mockFunc = jest.fn();
    traverse(obj, mockFunc);
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should not call function', () => {
    const obj = 'foo';

    const mockFunc = jest.fn();
    traverse(obj, mockFunc);
    expect(mockFunc).toHaveBeenCalledTimes(0);
  });

  it('should support onEnter/onLeave hooks', () => {
    const obj = {
      foo: {
        bar: 'bear',
      },
    };

    const onEnter = jest.fn();
    const onLeave = jest.fn();
    traverse(obj, {
      onEnter,
      onLeave,
    });

    expect(onEnter).toHaveBeenCalledTimes(2);
    expect(onEnter).nthCalledWith(1, {
      path: [],
      value: obj,
    });
    expect(onEnter).nthCalledWith(2, {
      path: ['foo'],
      value: obj.foo,
    });

    expect(onLeave).toHaveBeenCalledTimes(2);
    expect(onLeave).nthCalledWith(1, {
      path: ['foo'],
      value: obj.foo,
    });
    expect(onLeave).nthCalledWith(2, {
      path: [],
      value: obj,
    });
  });
});
