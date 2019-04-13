

// key assumptions:
// - json ast patch supports all (or at least a vast subset) of the operations that fast-json-patch does
// - json ast patch cannot result in syntax error
// - end code is expected to compute the patch using `computePatch` method
// - json/yaml/markdown take care of updating internal data needed to calculate positions + update diagnostics
// - json/yaml/markdown update parsed content
