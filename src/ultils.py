from os import environ
import sqlite3

def processInstr(instr):
    dbfile = 'static/real_estate.db'
    conn = sqlite3.connect(dbfile)
    try:
        query = conn.execute(instr)
    except Exception as e:
        print(e)