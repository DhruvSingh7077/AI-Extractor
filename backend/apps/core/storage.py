from whitenoise.storage import CompressedManifestStaticFilesStorage


class NonStrictManifestStaticFilesStorage(CompressedManifestStaticFilesStorage):
    """
    Same as whitenoise's CompressedManifestStaticFilesStorage, but doesn't
    raise a hard error when a file (e.g. a vendored .js references a
    .js.map source map that isn't present in the repo) can't be found
    during collectstatic. manifest_strict is a class attribute Django's
    ManifestStaticFilesStorage checks internally — it is NOT a constructor
    kwarg, so it must be set this way rather than via STORAGES["OPTIONS"].
    """

    manifest_strict = False