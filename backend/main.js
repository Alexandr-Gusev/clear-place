const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./db");
const {v4: uuid4} = require("uuid");
const PORT = process.env.PORT || 80;

const BLOCK_UNKNOWN_TOKENS = true;

const getCoords = async (req, res) => {
	try {
		let {token} = req.cookies;
		if (token) {
			const [users] = await db.query(
				"SELECT * FROM coords WHERE token = ?",
				[token]
			);
			if (users.length !== 1) {
				if (BLOCK_UNKNOWN_TOKENS) {
					res.status(403).json({error: "Bad token"});
					return;
				}
				await db.query(
					"INSERT INTO coords (token) VALUES (?)",
					[token]
				)
            }
		}
		const allCoords = [];
		let coords = [];
		const [items] = await db.query(
			"SELECT * FROM coords WHERE latitude IS NOT NULL AND longitude IS NOT NULL",
			[]
		);
		for (const item of items) {
			if (item.token === token) {
				coords = [item.latitude, item.longitude];
			} else {
				allCoords.push({id: item.user_id, coords: [item.latitude, item.longitude]});
			}
		}
		if (!token) {
			token = uuid4();
			await db.query(
				"INSERT INTO coords (token) VALUES (?)",
				[token]
			)
		}
		res.json({token, allCoords, coords});
	} catch (error) {
		console.error(error);
		res.status(500).json({error: "Unexpected error"});
	}
};

const updateCoords = async (req, res) => {
	try {
		const {latitude, longitude} = req.body;
		const [items] = await db.query(
			"UPDATE coords SET latitude = ?, longitude = ? WHERE token = ?",
			[latitude, longitude, req.cookies.token]
		);
		if (items.affectedRows !== 1) {
			res.status(403).json({error: "Bad token"});
		} else {
			res.status(200).json({});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({error: "Unexpected error"});
	}
};

const deleteCoords = async (req, res) => {
	try {
		const [items] = await db.query(
			"UPDATE coords SET latitude = NULL, longitude = NULL WHERE token = ?",
			[req.cookies.token]
		);
		if (items.affectedRows !== 1) {
			res.status(403).json({error: "Bad token"});
		} else {
			res.status(200).json({});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({error: "Unexpected error"});
	}
};

const app = express();
if (process.env.NODE_ENV !== 'production') {
	app.use(cors({
		origin: true,
		credentials: true
	}));
}
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));
if (process.env.NODE_ENV !== 'production') {
	app.use(express.static(path.join(__dirname, '../frontend/dist')));
}
app.post("/api/get-coords", getCoords);
app.post("/api/update-coords", updateCoords);
app.post("/api/delete-coords", deleteCoords);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
