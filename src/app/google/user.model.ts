export class User {

  Id: string;
  Email: string;

  static fromBasicProfile(profile: any): User {
      const user: User = new User();
      user.Id = profile.getId();
      user.Email = profile.getEmail();
      return user;
  }
}
