# Snapshot report for `tests/ir/passes/clean.ts`

The actual snapshot is saved in `clean.ts.snap`.

Generated by [AVA](https://avajs.dev).

## has-undefined-complex

> Snapshot 1

    Map {
      '$$typeParameter$$' => {
        circular: false,
        typeStats: Map {},
        value: {
          type: 'primitiveType',
          typeName: 'any',
        },
      },
    }

> Snapshot 2

    Map {
      '$$typeParameter$$' => {
        circular: false,
        typeStats: Map {},
        value: {
          childTypes: [
            {
              type: 'literal',
              value: true,
            },
            {
              type: 'literal',
              value: false,
            },
            {
              type: 'literal',
              value: 'hello',
            },
            {
              type: 'primitiveType',
              typeName: 'number',
            },
            {
              type: 'primitiveType',
              typeName: 'undefined',
            },
          ],
          hasUndefined: true,
          type: 'union',
        },
      },
    }

## has-undefined-simple

> Snapshot 1

    Map {
      '$$typeParameter$$' => {
        circular: false,
        typeStats: Map {},
        value: {
          childTypes: [
            {
              type: 'literal',
              value: 'undefined',
            },
            {
              type: 'literal',
              value: 0,
            },
            {
              type: 'literal',
              value: false,
            },
            {
              type: 'primitiveType',
              typeName: 'null',
            },
          ],
          type: 'union',
        },
      },
    }

> Snapshot 2

    Map {
      '$$typeParameter$$' => {
        circular: false,
        typeStats: Map {},
        value: {
          childTypes: [
            {
              type: 'literal',
              value: true,
            },
            {
              type: 'primitiveType',
              typeName: 'undefined',
            },
          ],
          hasUndefined: true,
          type: 'union',
        },
      },
    }