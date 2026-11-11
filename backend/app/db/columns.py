from sqlalchemy import BigInteger, Identity
from sqlalchemy.orm import MappedColumn, mapped_column

# Aurora DSQL only accepts bigint identity columns with an explicit cache size
# (1 or >= 65536). CACHE 1 keeps ids sequential; this blog's write rate is low.
ID_CACHE_SIZE = 1


def identity_pk() -> MappedColumn[int]:
    return mapped_column(BigInteger, Identity(cache=ID_CACHE_SIZE), primary_key=True)
