import {Request,Response} from "express";
import { searchProducts } from "../orchestrator/search.orchestrator";
import { parseOrThrow, searchQuerySchema } from "../validators/schemas";

export async function searchController(req:Request,res: Response) {
   const {q,limit} = parseOrThrow(searchQuerySchema,req.query);
    
     const result = await searchProducts(q, { limit, log: req.log });

    res.json(result);
}