# Snapshot report for `tests/exec-boolean/hoisting.ts`

The actual snapshot is saved in `hoisting.ts.snap`.

Generated by [AVA](https://avajs.dev).

## basic

> Snapshot 1

    `(p0) => {␊
      const f0 = (x0) => typeof x0 === "object" && x0 !== null;␊
    ␊
      return (␊
        !!p0 &&␊
        Object.prototype.hasOwnProperty.call(p0, "val1") &&␊
        f0(p0.val1) &&␊
        Object.prototype.hasOwnProperty.call(p0, "val2") &&␊
        f0(p0.val2)␊
      );␊
    };␊
    `

> Snapshot 2

    `(p0) => {␊
      const f0 = (x0) => typeof x0 === "object" && x0 !== null;␊
    ␊
      return (␊
        !!p0 &&␊
        Object.prototype.hasOwnProperty.call(p0, "val1") &&␊
        f0(p0.val1) &&␊
        Object.prototype.hasOwnProperty.call(p0, "val2") &&␊
        f0(p0.val2)␊
      );␊
    };␊
    `

> Snapshot 3

    `(p0) => {␊
      const f0 = (x0) =>␊
        !!x0 &&␊
        x0.constructor === Array &&␊
        ((x1) => {␊
          for (const x2 of x1) {␊
            if (!(typeof x2 === "string")) return false;␊
          }␊
    ␊
          return true;␊
        })(x0);␊
    ␊
      return (␊
        !!p0 &&␊
        Object.prototype.hasOwnProperty.call(p0, "val1") &&␊
        f0(p0.val1) &&␊
        Object.prototype.hasOwnProperty.call(p0, "val2") &&␊
        f0(p0.val2)␊
      );␊
    };␊
    `
