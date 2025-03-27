import type { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "@/libs/utils/connectDatabase";

await connectToDatabase();
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "✅ Server is running!" });
}
