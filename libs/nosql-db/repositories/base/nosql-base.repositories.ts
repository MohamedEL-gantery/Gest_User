import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  ClientSession,
  PipelineStage,
  AggregateOptions,
  InsertManyOptions,
} from "mongoose";
import { BadRequestAppException } from "@/libs/http/";
import { INoSqlRepository } from "@/libs/nosql-db/repositories/interfaces";

export abstract class NoSqlRepository<T extends Document>
  implements INoSqlRepository<T>
{
  protected model: Model<T>;

  protected constructor(model: Model<T>) {
    this.model = model;
  }

  // 1️⃣ CREATE OPERATIONS

  /**
   * Creates a single record in the database.
   * @param data - The data to create the record.
   * @returns The created document.
   */

  public async createOne(data: Partial<T>, options?: QueryOptions): Promise<T> {
    // Ensure options is always an object
    const queryOptions = options || {};
    return this.model.create([data], queryOptions).then((result) => result[0]);
  }

  /**
   * Creates a single record or throws an exception if creation fails.
   * @param data - The data to create the record.
   * @param errorMessage - The error message if creation fails.
   * @param options - The query options for Transaction.
   * @returns The created document.
   */

  public async createOneOrThrowException(
    data: Partial<T>,
    errorMessage = "Failed to create item!",
    options?: QueryOptions
  ): Promise<T> {
    const createdDocument = await this.createOne(data, options);
    if (!createdDocument) {
      throw new BadRequestAppException(errorMessage, 404);
    }
    return createdDocument;
  }

  /**
   * Creates multiple records in the database.
   * @param data - The array of data to insert.
   * @param options - The query options for Transaction.
   * @returns The created documents.
   */

  public async createMany(
    data: Partial<T>[],
    options?: QueryOptions
  ): Promise<T[]> {
    const queryOptions = options || {};
    return this.model.insertMany(
      data as T[],
      queryOptions as InsertManyOptions
    );
  }

  /**
   * Creates multiple records or throws an exception if creation fails.
   * @param data - The array of data to insert.
   * @param errorMessage - The error message if creation fails.
   * @param options - The query options for Transaction.
   * @returns The created documents.
   */

  public async createManyOrThrowException(
    data: Partial<T>[],
    errorMessage = "Failed to create items!",
    options?: QueryOptions
  ): Promise<T[]> {
    const createdDocuments = await this.createMany(data, options);
    if (createdDocuments.length === 0) {
      throw new BadRequestAppException(errorMessage, 404);
    }
    return createdDocuments;
  }

  // 2️⃣ READ OPERATIONS

  /**
   * Retrieves a single document based on a query.
   * @param query - The query to find the document.
   * @param fields - The fields to select.
   * @param options - The options for the Transaction.
   * @returns The found document or null.
   */

  public async getOne(
    query: FilterQuery<T>,
    fields: string[] = [],
    options?: QueryOptions
  ): Promise<T | null> {
    const selectQuery = fields.length > 0 ? fields.join(" ") : "";
    return await this.model.findOne(query, options).select(selectQuery).exec();
  }

  /**
   * Retrieves a single document or throws an exception if not found.
   * @param query - The query to find the document.
   * @param fields - The fields to select.
   * @param errorMessage - The error message if not found.
   * @returns The found document.
   */

  public async getOneOrThrowException(
    query: FilterQuery<T>,
    fields: string[] = [],
    errorMessage = "Item not found",
    options?: QueryOptions
  ): Promise<T> {
    const selectQuery = fields.length > 0 ? fields.join(" ") : "";
    const result = await this.model
      .findOne(query, options)
      .select(selectQuery)
      .exec();

    if (!result) {
      throw new BadRequestAppException(errorMessage, 404);
    }
    return result;
  }

  /**
   * Retrieves all documents matching the query.
   * @param query - The query to filter documents.
   * @param fields - The fields to select.
   * @returns An object containing the documents and total count.
   */

  public async getAll(
    query: FilterQuery<T>,
    fields: string[] = [],
    options?: QueryOptions
  ): Promise<{ data: T[]; total: number }> {
    const selectQuery = fields.length > 0 ? fields.join(" ") : "";

    const [data, total] = await Promise.all([
      this.model.find(query, options).select(selectQuery).exec(),
      this.count(query),
    ]);

    return { data, total };
  }

  /**
   * Retrieves documents with pagination.
   * @param query - The query to filter documents.
   * @param fields - The fields to select.
   * @param page - The current page number.
   * @param limit - The number of documents per page.
   * @returns An object containing paginated data and metadata.
   */

  public async getAllWithPagination(
    query: FilterQuery<T>,
    fields: string[] = [],
    page = 1,
    limit = 10,
    options?: QueryOptions
  ): Promise<{
    data: T[];
    total: number;
    totalPage: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    const selectQuery = fields.length > 0 ? fields.join(" ") : "";

    const [data, total] = await Promise.all([
      this.model
        .find(query, options)
        .select(selectQuery)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.count(query),
    ]);

    return {
      data,
      total,
      totalPage: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 3️⃣ UPDATE OPERATIONS

  /**
   * Updates a single document based on a query.
   * @param query - The query to filter documents.
   * @param updateData - The data to update.
   * @param options - Optional update options.
   * @returns The updated document or null.
   */

  public async updateOne(
    query: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { runValidators: true, new: true }
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(query, updateData, options).exec();
  }

  /**
   * Updates a single document based on a query or throws an exception.
   * @param query - The query to filter documents.
   * @param updateData - The data to update.
   * @param options - Optional update options.
   * @returns The updated document or null.
   */

  public async updateOneOrThrowException(
    query: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    errorMessage = "Item not found for update!",
    options: QueryOptions = { runValidators: true, new: true }
  ): Promise<T | null> {
    const updatedDocument = await this.updateOne(query, updateData, options);

    if (!updatedDocument) {
      throw new BadRequestAppException(errorMessage, 404);
    }
    return updatedDocument;
  }

  // 4️⃣ DELETE OPERATIONS

  /**
   * Deletes a single document based on a query.
   * @param query - The query to filter documents.
   * @returns  The deleted document or null.
   */
  public async deleteOne(
    query: FilterQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findOneAndDelete(query, options).exec();
  }

  /**
   * Deletes a single document based on a query or throws an exception.
   * @param query - The query to filter documents.
   * @returns  The deleted document or null.
   */

  public async deleteOneOrThrowException(
    query: FilterQuery<T>,
    errorMessage = "Item not found for hard deletion.",
    option?: QueryOptions
  ): Promise<T> {
    const deletedDocument = await this.deleteOne(query, option);
    if (!deletedDocument) {
      throw new BadRequestAppException(errorMessage, 404);
    }
    return deletedDocument;
  }

  // 5️⃣ COUNT & TRANSACTIONS & AGGREGATION

  /**
   *  Counts the number of documents that match the provided query.
   * @param query - The query to filter documents.
   * @returns  The count of matching documents.
   */

  public async count(query: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }

  /**
   *  Creates a new transaction session.
   * @returns  A new transaction session.
   */
  public async createTransaction(): Promise<ClientSession> {
    const session = await this.model.db.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Perform an aggregation operation using the provided pipeline stages.
   *
   * @param pipeline - The aggregation pipeline stages.
   * @param options - Optional aggregation options.
   * @returns The aggregated results.
   */
  public async aggregate(
    pipeline: PipelineStage[],
    options: AggregateOptions = {}
  ): Promise<T[]> {
    return await this.model.aggregate(pipeline, options).exec();
  }
}
