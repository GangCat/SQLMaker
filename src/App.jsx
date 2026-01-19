import { useMemo, useState } from "react";

const OPERATIONS = [
  { id: "select", label: "SELECT" },
  { id: "insert", label: "INSERT" },
  { id: "update", label: "UPDATE" },
  { id: "delete", label: "DELETE" }
];

const defaultColumns = "id, name, created_at";
const defaultWhere = "id = #{id}";

const normalizeColumns = (value) =>
  value
    .split(",")
    .map((col) => col.trim())
    .filter(Boolean);

const toSqlIdentifier = (value) => value.trim();

const buildSelect = (table, columns, where) => {
  const selectColumns = columns.length ? columns.join(", ") : "*";
  const lines = [
    `<select id=\"select${table}\" resultType=\"map\">`,
    `  SELECT ${selectColumns}`,
    `  FROM ${table}`
  ];

  if (where.trim()) {
    lines.push("  <where>");
    lines.push(`    ${where}`);
    lines.push("  </where>");
  }

  lines.push("</select>");
  return lines.join("\n");
};

const buildInsert = (table, columns) => {
  const colList = columns.join(", ");
  const values = columns.map((col) => `#{${col}}`).join(", ");

  return [
    `<insert id=\"insert${table}\">`,
    `  INSERT INTO ${table} (${colList})`,
    `  VALUES (${values})`,
    "</insert>"
  ].join("\n");
};

const buildUpdate = (table, columns, where) => {
  const lines = [
    `<update id=\"update${table}\">`,
    `  UPDATE ${table}`,
    "  <set>",
    ...columns.map((col) => `    ${col} = #{${col}},`),
    "  </set>"
  ];

  if (where.trim()) {
    lines.push("  <where>");
    lines.push(`    ${where}`);
    lines.push("  </where>");
  }

  lines.push("</update>");
  return lines.join("\n");
};

const buildDelete = (table, where) => {
  const lines = [
    `<delete id=\"delete${table}\">`,
    `  DELETE FROM ${table}`
  ];

  if (where.trim()) {
    lines.push("  <where>");
    lines.push(`    ${where}`);
    lines.push("  </where>");
  }

  lines.push("</delete>");
  return lines.join("\n");
};

const buildSql = ({ operation, tableName, columns, where }) => {
  if (!tableName.trim()) {
    return "테이블명을 입력하면 마이바티스 SQL이 생성됩니다.";
  }

  const table = toSqlIdentifier(tableName);

  switch (operation) {
    case "select":
      return buildSelect(table, columns, where);
    case "insert":
      return buildInsert(table, columns);
    case "update":
      return buildUpdate(table, columns, where);
    case "delete":
      return buildDelete(table, where);
    default:
      return "지원하지 않는 타입입니다.";
  }
};

const App = () => {
  const [operation, setOperation] = useState("select");
  const [tableName, setTableName] = useState("user");
  const [columnInput, setColumnInput] = useState(defaultColumns);
  const [whereClause, setWhereClause] = useState(defaultWhere);

  const columns = useMemo(() => normalizeColumns(columnInput), [columnInput]);

  const sql = useMemo(
    () =>
      buildSql({
        operation,
        tableName,
        columns,
        where: whereClause
      }),
    [operation, tableName, columns, whereClause]
  );

  const showWhere = operation !== "insert";

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SQL Maker</p>
          <h1>마이바티스 SQL 생성기</h1>
          <p className="subtitle">
            테이블과 컬럼 정보를 입력하면 기본적인 CRUD SQL을 빠르게 만들 수
            있습니다.
          </p>
        </div>
      </header>

      <main className="layout">
        <section className="card">
          <h2>입력</h2>
          <div className="field">
            <label htmlFor="operation">쿼리 종류</label>
            <div className="chips">
              {OPERATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    operation === item.id ? "chip chip-active" : "chip"
                  }
                  onClick={() => setOperation(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="table">테이블명</label>
            <input
              id="table"
              value={tableName}
              onChange={(event) => setTableName(event.target.value)}
              placeholder="예: user"
            />
          </div>

          <div className="field">
            <label htmlFor="columns">컬럼명 (쉼표로 구분)</label>
            <textarea
              id="columns"
              rows={3}
              value={columnInput}
              onChange={(event) => setColumnInput(event.target.value)}
              placeholder="예: id, name, created_at"
            />
            <p className="helper">입력한 컬럼은 INSERT/UPDATE에 사용됩니다.</p>
          </div>

          {showWhere && (
            <div className="field">
              <label htmlFor="where">WHERE 조건</label>
              <textarea
                id="where"
                rows={2}
                value={whereClause}
                onChange={(event) => setWhereClause(event.target.value)}
                placeholder="예: id = #{id}"
              />
              <p className="helper">필요하면 AND, OR 조건을 직접 입력하세요.</p>
            </div>
          )}
        </section>

        <section className="card">
          <div className="output-header">
            <h2>생성된 SQL</h2>
            <span className="badge">MyBatis</span>
          </div>
          <pre className="code-block">
            <code>{sql}</code>
          </pre>
        </section>
      </main>
    </div>
  );
};

export default App;
