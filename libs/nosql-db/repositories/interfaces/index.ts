import {
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  ClientSession,
  PipelineStage,
  AggregateOptions,
} from "mongoose";

/**
 * Interface defining the contract for a generic NoSQL repository.
 */
export interface INoSqlRepository<T extends Document> {
  createOne(data: Partial<T>, options?: QueryOptions): Promise<T>;
  createOneOrThrowException(
    data: Partial<T>,
    errorMessage?: string,
    options?: QueryOptions
  ): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  createManyOrThrowException(
    data: Partial<T>[],
    errorMessage?: string,
    options?: QueryOptions
  ): Promise<T[]>;

  getOne(
    query: FilterQuery<T>,
    fields?: string[],
    options?: QueryOptions
  ): Promise<T | null>;
  getOneOrThrowException(
    query: FilterQuery<T>,
    fields?: string[],
    errorMessage?: string,
    options?: QueryOptions
  ): Promise<T>;
  getAll(
    query: FilterQuery<T>,
    fields?: string[],
    options?: QueryOptions
  ): Promise<{ data: T[]; total: number }>;
  getAllWithPagination(
    query: FilterQuery<T>,
    fields?: string[],
    page?: number,
    limit?: number,
    options?: QueryOptions
  ): Promise<{
    data: T[];
    total: number;
    totalPage: number;
    currentPage: number;
  }>;

  updateOne(
    query: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null>;
  updateOneOrThrowException(
    query: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    errorMessage?: string,
    options?: QueryOptions
  ): Promise<T | null>;

  deleteOne(query: FilterQuery<T>): Promise<T | null>;
  deleteOneOrThrowException(
    query: FilterQuery<T>,
    errorMessage?: string,
    options?: QueryOptions
  ): Promise<T>;

  count(query?: FilterQuery<T>): Promise<number>;

  createTransaction(): Promise<ClientSession>;

  aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
    optionsTransaction?: QueryOptions
  ): Promise<T[]>;
}
