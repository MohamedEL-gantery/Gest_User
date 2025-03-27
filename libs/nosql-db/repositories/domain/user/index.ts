import { NoSqlRepository } from "@/libs/nosql-db/repositories/base/nosql-base.repositories";
import { UserModel } from "@/libs/nosql-db/models/userModel";
import { Model } from "mongoose";
import { User } from "@/libs/nosql-db/contracts/interfaces/user";

export class UserRepository extends NoSqlRepository<User> {
  private static instance: UserRepository;
  private constructor(model: Model<User>) {
    super(model);
  }
  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository(UserModel);
    }
    return UserRepository.instance;
  }
}
