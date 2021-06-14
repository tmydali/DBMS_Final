import sqlite3

def processInstr(json):
    result = {
        'method': None,
        'data': None
    };
    if json['method'] == 'sql-query':
        result['data'], result['method'] = directQuery(json['data'])
    elif json['method'] == 'get-tables':
        result['data'], result['method'] = getTables()
    elif json['method'] == 'get-table-data':
            result['data'], result['method'] = getTableData(json['data'])
    elif json['method'] == 'get-all-districts':
        result['data'], result['method'] = getAllDistricts()
    elif json['method'] == 'get-all-landuse':
        result['data'], result['method'] = getAllLandUse()
    elif json['method'] == 'get-building-data':
        result['data'], result['method'] = getBuildingData(json['data'])
    elif json['method'] == 'get-trade-data':
        result['data'], result['method'] = getTradeData(json['data'])
    
    return result

def directQuery(instr):
    dbfile = 'static/real_estate.db'
    conn = sqlite3.connect(dbfile)
    cur = conn.cursor()
    try:
        query = cur.execute(instr)
        des = cur.description
        colname = [x[0] for x in des]
        data = query.fetchall()
        data.insert(0, colname)
        return data, 'success'
    except Exception as e:
        return 'error', 'fail'

def getTables():
    dbfile = 'static/real_estate.db'
    conn = sqlite3.connect(dbfile)
    cur = conn.cursor()
    try:
        query = cur.execute('SELECT name FROM sqlite_master WHERE type="table";')
        data = query.fetchall()
        return data, 'success'
    except Exception as e:
        return 'error', 'fail'

def getTableData(name):
    instr = f'SELECT * FROM {name};'
    return directQuery(instr)

def getAllDistricts():
    instr = 'SELECT DISTINCT District FROM LOT'
    return directQuery(instr)

def getAllLandUse():
    instr = 'SELECT DISTINCT Description FROM CITY_PLANNING WHERE Description IN("住宅區", "商業區", "乙種工業區");'
    return directQuery(instr)

def getBuildingData(data):
    In = 'IN' if data[0] == '0' else 'NOT IN'
    district = f'"{data[3]}"' if data[3] != '所有行政區' else 'District'
    near = 'EXISTS' if data[2] else ''
    near_clause = f'AND {near} (SELECT BID FROM NEARBY WHERE BUILDING.BID = NEARBY.BID)' if data[2] else ''
    belong = 'EXISTS' if data[1] == '0' else 'NOT EXISTS'
    landuse = f'"{data[4]}"' if data[4] != '所有土地利用' else 'Description'
    instr = f'''
        SELECT * FROM BUILDING
        WHERE LID {In} (
            SELECT LID FROM LOT
            WHERE District = {district}
        )
        {near_clause}
        AND {belong} (
            SELECT Description FROM CITY_PLANNING
            WHERE Description = {landuse}
            AND BUILDING.Land_use = CITY_PLANNING.Land_use
        );
        '''
    return directQuery(instr)

def getTradeData(data):
    instr = ''
    func = ''
    if data == '近三年各區交易統計':
        instr = '''
                SELECT LOT.District, COUNT(*), MAX(Price), MIN(Price), AVG(Price) FROM TRADE
                INNER JOIN BUILDING
                ON TRADE.BID = BUILDING.BID
                INNER JOIN LOT
                ON BUILDING.LID = LOT.LID
                WHERE Date >= "2019-01-01" GROUP BY LOT.District;
                '''
    elif data == '總交易額大戶':
        instr = '''
            SELECT HOLDER.*, buy_price+sell_price AS Total_Transaction
            FROM (
                SELECT PID AS Buyer, SUM(TRADE.Price) as buy_price  FROM HOLDER
                INNER JOIN TRADE
                ON HOLDER.PID=TRADE.PID_buyer
                GROUP BY PID
            ) a, 
            (
                SELECT PID AS Seller, SUM(TRADE.Price) AS sell_price FROM HOLDER
                INNER JOIN TRADE
                ON HOLDER.PID=TRADE.PID_seller
                GROUP BY PID
            ) b
            INNER JOIN HOLDER ON HOLDER.PID = a.Buyer
            WHERE a.Buyer=b.Seller AND Total_Transaction >= 3000
            ORDER BY Total_Transaction DESC;
            '''
    return directQuery(instr)