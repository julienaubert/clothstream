from itertools import count


def subargs(kwargs, prefix):
    prefix = "{}__".format(prefix)
    ret = {key[len(prefix):]: kwargs.pop(key) for key in kwargs.keys() if key.startswith(prefix)}
    return ret


def nextname(prefix, counters={}):
    if prefix not in counters:
        counters[prefix] = count()
    return "{0}-{1}".format(prefix, next(counters[prefix]))

