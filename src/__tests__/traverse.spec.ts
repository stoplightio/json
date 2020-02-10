import { traverse } from "../traverse";

describe("traverse", () => {
  it("should call function", () => {
    const obj = {
      foo: {
        bar: 'bear',
      },
    };

    const mockFunc = jest.fn();
    traverse(obj, mockFunc);
    expect(mockFunc).toHaveBeenCalled();
  });
});
