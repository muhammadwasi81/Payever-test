export class User {
  id?: string;
  name: string;
  email: string;
  age: number;

  constructor(name: string, email: string, age: number, id?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.age = age;
  }
}
