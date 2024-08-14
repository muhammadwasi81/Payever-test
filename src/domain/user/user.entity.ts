export class User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  avatarHash?: string;
  avatarBase64?: string;
  userId?: string;
  constructor(
    id?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    avatar?: string,
    avatarHash?: string,
    avatarBase64?: string,
    userId?: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.avatar = avatar;
    this.avatarHash = avatarHash;
    this.avatarBase64 = avatarBase64;
    this.userId = userId;
  }
}
