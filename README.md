# LombokTS
A decorator-based module that allows developer to reduce boilerplate code, make your code more fatty-free.

**LombokTS** use [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) behind the scene to read the Abstract Syntax Tree (AST) of your TypeScript source code and then determine what should declaration to generate into .d.ts ([declaration file](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)) for using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) technique. This technique allows LombokTS to merge a magic method from LombokTS into the existing decorated class.

Special thanks to **[Lombok](https://github.com/projectlombok/lombok)**. This project (LombokTS) is strongly inspired from their.

## Getting started
Install LombokTS module

```bash
# For NPM user
npm install lombokts
# For Yarn user
yarn install lombokts
# For PNPM user
pnpm install lombokts
```

Then run LombokTS generator engine with `npx lombokts` and ready to go!  
*(We plan to remove this step and make LombokTS a TSC plugin for automatically starting up)*

## Features

### @Getter / @Setter
- **@Getter** - The property decorator to create a getter method automatically.  
  A getter method returns the property, and is named `getFoo` if the property is called `foo`.
- **@Setter** - The property decorator to create a setter method automatically.  
  A setter method is named `setFoo` if the property is called `foo`, returns void, and takes 1 parameter of the same type as the property to set the field to the given value.

Example:
```ts
export class People {
  @Getter
  @Setter
  private readonly name: string = 'John Doe';
}
```
```ts
// You can call getter and setter seamlessly without any TypeScript warning!
const people = new People();
people.getName(); // 'John Doe'
people.setName('Jane Doe');
people.getName(); // 'Jane Doe'
```

#### Limitation
- LombokTS generator engine reads your source code and determines what parameter type or return type should be by reading `TypeReference` of `PropertyDeclaration` on AST, so you must explicitly define the type.
- We recommend you to use [this TypeScript ESLint rule](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/typedef.md#membervariabledeclaration) to enforce type annotations on member variables of classes.

## Contribution
There are many ways in which you can participate in this project, for example:

- [Submit bugs and feature requests](https://github.com/vectier/lombokts/issues).
- Review [source code changes](https://github.com/vectier/lombokts/pulls).
- Fixing issues and contributing directly to the code base by [submitting pull requests](https://github.com/vectier/lombokts/pulls).
