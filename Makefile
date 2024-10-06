

start-local:
	PORT=3000 \
	HOST=0.0.0.0 \
	DATABASE_URL=postgres://user:password@localhost:5435/crud_db \
	npm run dev

