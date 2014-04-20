

def setup_modified_seq(connection):
    # detect cases where we are using the wrong pk (either in test or in code, e.g. user.pk vs user.profile.pk)
    if connection.vendor == 'postgresql':
        print('is postgres vnedor:', connection.vendor)
        def get_seqs(cursor):
            cursor.execute("SELECT c.relname FROM pg_class c WHERE c.relkind = 'S'")
            for seq_row in cursor.fetchall():
                seq = seq_row[0]
                yield seq
        cursor = connection.cursor()
        for count, seq in enumerate(get_seqs(cursor)):
            cursor.execute("ALTER SEQUENCE {} RESTART WITH %s;".format(seq), [(count+1)*1000])

