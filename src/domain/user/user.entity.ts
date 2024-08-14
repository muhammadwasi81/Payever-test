export class User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  avatarHash?: string;
  avatarBase64?: string;
  externalId?: string;
  constructor(
    id?: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    avatar?: string,
    avatarHash?: string,
    avatarBase64?: string,
    externalId?: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.avatar = avatar;
    this.avatarHash = avatarHash;
    this.avatarBase64 = avatarBase64;
    this.externalId = externalId;
  }
}
