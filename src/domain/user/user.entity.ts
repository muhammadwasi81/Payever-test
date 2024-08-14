export class User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    avatar?: string,
    id?: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.avatar = avatar;
  }
}
