// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { bijoyToUnicode, unicodeToBijoy } from './core';

const app = express();
app.use(cors());
app.use(express.json());

interface ConvertRequest {
    text: string;
}

app.post('/to-unicode', (req: Request<{}, {}, ConvertRequest>, res: Response) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
    }
    res.json({ converted: bijoyToUnicode(text) });
});

app.post('/to-ansi', (req: Request<{}, {}, ConvertRequest>, res: Response) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
    }
    res.json({ converted: unicodeToBijoy(text) });
});

// For Excel WEBSERVICE support
app.get('/api/convert', (req: Request, res: Response) => {
    const text = req.query.text as string;
    const type = req.query.type as string;
    
    if (!text) {
        res.send("");
        return;
    }

    if (type === 'u2b') {
        res.send(unicodeToBijoy(text));
    } else {
        res.send(bijoyToUnicode(text));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});