import { Request, Response } from "express";

import { v4 as uuidV4 } from 'uuid';


export const startLive = async (req: Request, res: Response) => {
    res.redirect(`/live-streaming/${uuidV4()}`);
};


export const renderRoom = async (req: Request, res: Response) => {
    res.render("room", { roomId: req.params.room });
};
