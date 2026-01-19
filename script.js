// Update form visibility based on query type
document.getElementById('queryType').addEventListener('change', function() {
    const queryType = this.value;
    const whereGroup = document.getElementById('whereGroup');
    const setGroup = document.getElementById('setGroup');
    const valuesGroup = document.getElementById('valuesGroup');
    const resultTypeGroup = document.querySelector('label[for="resultType"]').parentElement;

    // Show/hide relevant fields based on query type
    whereGroup.style.display = (queryType === 'select' || queryType === 'update' || queryType === 'delete') ? 'block' : 'none';
    setGroup.style.display = (queryType === 'update') ? 'block' : 'none';
    valuesGroup.style.display = (queryType === 'insert') ? 'block' : 'none';
    resultTypeGroup.style.display = (queryType === 'select') ? 'block' : 'none';
});

// Add a new WHERE condition
function addCondition() {
    const whereConditions = document.getElementById('whereConditions');
    const newCondition = document.createElement('div');
    newCondition.className = 'where-condition';
    newCondition.innerHTML = `
        <input type="text" class="where-column" placeholder="칼럼명" />
        <select class="where-operator">
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">></option>
            <option value="<"><</option>
            <option value=">=">>=</option>
            <option value="<="><=</option>
            <option value="LIKE">LIKE</option>
            <option value="IN">IN</option>
        </select>
        <input type="text" class="where-value" placeholder="값 (예: #{id})" />
        <button type="button" class="btn-remove" onclick="removeCondition(this)">-</button>
    `;
    whereConditions.appendChild(newCondition);
}

// Remove a WHERE condition
function removeCondition(button) {
    const whereConditions = document.getElementById('whereConditions');
    if (whereConditions.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('최소 1개의 조건은 필요합니다.');
    }
}

// Generate SQL query
function generateSQL() {
    const queryType = document.getElementById('queryType').value;
    const tableName = document.getElementById('tableName').value.trim();
    const columns = document.getElementById('columns').value.trim();
    const mybatisId = document.getElementById('mybatisId').value.trim();
    const resultType = document.getElementById('resultType').value.trim();

    if (!tableName) {
        alert('테이블 명을 입력해주세요.');
        return;
    }

    if (!mybatisId) {
        alert('MyBatis Statement ID를 입력해주세요.');
        return;
    }

    let sql = '';

    switch (queryType) {
        case 'select':
            sql = generateSelectQuery(tableName, columns, mybatisId, resultType);
            break;
        case 'insert':
            sql = generateInsertQuery(tableName, columns, mybatisId);
            break;
        case 'update':
            sql = generateUpdateQuery(tableName, mybatisId);
            break;
        case 'delete':
            sql = generateDeleteQuery(tableName, mybatisId);
            break;
    }

    document.getElementById('sqlOutput').innerHTML = `<code>${escapeHtml(sql)}</code>`;
}

// Generate SELECT query
function generateSelectQuery(tableName, columns, mybatisId, resultType) {
    const columnList = columns ? columns.split(',').map(c => c.trim()).join(', ') : '*';
    const whereClause = buildWhereClause();
    
    let sql = `<select id="${mybatisId}"`;
    if (resultType) {
        sql += ` resultType="${resultType}"`;
    }
    sql += `>\n    SELECT ${columnList}\n    FROM ${tableName}`;
    
    if (whereClause) {
        sql += `\n    <where>\n${whereClause}\n    </where>`;
    }
    
    sql += `\n</select>`;
    return sql;
}

// Generate INSERT query
function generateInsertQuery(tableName, columns, mybatisId) {
    const columnList = columns ? columns.split(',').map(c => c.trim()).join(', ') : '';
    const insertValues = document.getElementById('insertValues').value.trim();
    
    if (!columnList) {
        alert('칼럼 명을 입력해주세요.');
        return '';
    }
    
    if (!insertValues) {
        alert('INSERT 값을 입력해주세요.');
        return '';
    }
    
    let sql = `<insert id="${mybatisId}">\n`;
    sql += `    INSERT INTO ${tableName} (${columnList})\n`;
    sql += `    VALUES (${insertValues})\n`;
    sql += `</insert>`;
    return sql;
}

// Generate UPDATE query
function generateUpdateQuery(tableName, mybatisId) {
    const setValues = document.getElementById('setValues').value.trim();
    const whereClause = buildWhereClause();
    
    if (!setValues) {
        alert('SET 값을 입력해주세요.');
        return '';
    }
    
    let sql = `<update id="${mybatisId}">\n`;
    sql += `    UPDATE ${tableName}\n`;
    sql += `    <set>\n`;
    
    // Split SET values by comma and format each line
    const setLines = setValues.split(',').map(s => s.trim());
    setLines.forEach((line, index) => {
        sql += `        ${line}`;
        if (index < setLines.length - 1) {
            sql += ',';
        }
        sql += '\n';
    });
    
    sql += `    </set>`;
    
    if (whereClause) {
        sql += `\n    <where>\n${whereClause}\n    </where>`;
    }
    
    sql += `\n</update>`;
    return sql;
}

// Generate DELETE query
function generateDeleteQuery(tableName, mybatisId) {
    const whereClause = buildWhereClause();
    
    let sql = `<delete id="${mybatisId}">\n`;
    sql += `    DELETE FROM ${tableName}`;
    
    if (whereClause) {
        sql += `\n    <where>\n${whereClause}\n    </where>`;
    }
    
    sql += `\n</delete>`;
    return sql;
}

// Build WHERE clause from conditions
function buildWhereClause() {
    const conditions = document.querySelectorAll('.where-condition');
    let whereClause = '';
    let validConditions = [];
    
    conditions.forEach(condition => {
        const column = condition.querySelector('.where-column').value.trim();
        const operator = condition.querySelector('.where-operator').value;
        const value = condition.querySelector('.where-value').value.trim();
        
        if (column && value) {
            validConditions.push({ column, operator, value });
        }
    });
    
    if (validConditions.length > 0) {
        validConditions.forEach((cond, index) => {
            if (index > 0) {
                whereClause += '        <if test="true">AND </if>\n';
            }
            whereClause += `        <if test="${getTestCondition(cond.value)}">\n`;
            whereClause += `            ${cond.column} ${cond.operator} ${cond.value}\n`;
            whereClause += `        </if>`;
            if (index < validConditions.length - 1) {
                whereClause += '\n';
            }
        });
    }
    
    return whereClause;
}

// Get test condition for MyBatis <if> tag
function getTestCondition(value) {
    // Extract parameter name from #{paramName}
    const match = value.match(/#{(\w+)}/);
    if (match) {
        const paramName = match[1];
        return `${paramName} != null and ${paramName} != ''`;
    }
    return 'true';
}

// Escape HTML for display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to clipboard
function copyToClipboard() {
    const sqlOutput = document.getElementById('sqlOutput');
    const text = sqlOutput.textContent;
    const copyMessage = document.getElementById('copyMessage');
    
    navigator.clipboard.writeText(text).then(() => {
        copyMessage.textContent = '✓ 클립보드에 복사되었습니다!';
        copyMessage.className = 'copy-message success show';
        setTimeout(() => {
            copyMessage.className = 'copy-message';
        }, 3000);
    }).catch(err => {
        copyMessage.textContent = '✗ 복사에 실패했습니다.';
        copyMessage.className = 'copy-message error show';
        setTimeout(() => {
            copyMessage.className = 'copy-message';
        }, 3000);
    });
}

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Trigger change event to set initial state
    document.getElementById('queryType').dispatchEvent(new Event('change'));
});
