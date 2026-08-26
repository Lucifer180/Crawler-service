import {Request,Response} from "express";
import { searchProducts } from "../orchestrator/search.orchestrator";

export async function searchController(req:Request,res: Response) {
    const q = req.query.q as string
    
    const result = await searchProducts(q);

    res.json(result);
}