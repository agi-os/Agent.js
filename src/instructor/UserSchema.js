/**
 * UserSchema represents the schema for a user object.
 */
// const UserSchema = z.object({
//   // Description will be used in the prompt
//   age: z.number().min(0).max(120).describe('The age of the user'),
//   firstName: z
//     .string()
//     .describe(
//       'The first name of the user, lowercase with capital first letter'
//     ),
//   surname: z
//     .string()
//     .describe('The surname of the user, lowercase with capital first letter'),
//   sex: z
//     .enum(['M', 'F'])
//     .describe('The sex of the user, guess if not provided'),
// })

const UserSchemaJson = JSON.stringify({
  age: {
    type: 'number',
    constraints: {
      min: 0,
      max: 120,
    },
    description: 'The age of the user',
  },
  firstName: {
    type: 'string',
    description:
      'The first name of the user, lowercase with capital first letter',
  },
  surname: {
    type: 'string',
    description: 'The surname of the user, lowercase with capital first letter',
  },
  sex: {
    type: 'enum',
    constraints: {
      values: ['M', 'F'],
    },
    description: 'The sex of the user, guess if not provided',
  },
})

export default UserSchemaJson
