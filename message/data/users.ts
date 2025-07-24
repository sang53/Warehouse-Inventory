interface User {
  id: number;
  firstName: string;
  lastName: string;
}

class UserStorage {
  users: Map<number, User>;
  currentId: number;
  emptyIds: number[];
  constructor() {
    this.users = new Map();
    this.currentId = 0;
    this.emptyIds = [];
    this.addUser("John", "Doe");
  }

  addUser(firstName: string, lastName: string) {
    const newUser = {
      id: this.emptyIds.pop() ?? this.currentId++,
      firstName,
      lastName,
    };
    this.users.set(newUser.id, newUser);
  }

  getUsers() {
    return this.users.values();
  }

  getUserById(id: number) {
    return this.users.get(id);
  }

  updateUser({ id, firstName, lastName }: User) {
    if (!this.users.has(id)) return false;
    this.users.set(id, { id, firstName, lastName });
    return true;
  }

  deleteUser(id: number) {
    if (!this.users.has(id)) return false;
    this.users.delete(id);
    this.emptyIds.push(id);
    return true;
  }
}

export const userStorage = new UserStorage();
