ReadXML <- function(files, attributes, row, columns) {
  assert(is.character(files) && length(files) > 0,
         "files should be a character vector specifying the file path(s).")
  assert(is.character(row) && length(row) == 1,
         "row should be a single string.")
  assert(is.character(columns), "columns should be a vector of strings.")
  ## Ensure that when a single column is given, it is still treated as an array.
  columns <- as.list(columns)

  ## Processing of attributes. The isTRUE implicitly ensures that length = 1.
  ## First the value is checked for validity.
  is.relation <- tryCatch(is.character(attributes) && isTRUE(is.relation(attributes)),
                          error = identity)
  if (inherits(is.relation, "error"))
      is.relation <- FALSE

  ## If the value is not a relation name:
  if (!is.relation) {
    attributes <- substitute(attributes)

    ## A quoted name is simply converted to a character.
    if (is.symbol(attributes)) {
      attributes <- as.character(attributes)
    } else if (is.character(attributes)) {
      ## No processing needed here. Just avoids default case.
    } else {
      ## Default case is that the attributes are manually given as a call.
      assert(is.call(attributes), "illegal format for attributes.")
      warning.if(attributes[[1]] != quote(c), "attributes not a call to `c`.")

      ## The call is converted to a list structure with a special case for an empty call.
      if (length(attributes) == 1)
        attributes <- list(quote(expr = ))
      else
        attributes <- as.list(attributes)[-1]

      attributes <- lapply(attributes, convert.type)
    }
  }

  if (is.character(attributes)) {
    assert(isTRUE(is.relation(attributes)), "attributes does not name a relation.")
    col.names <- get.attributes(attributes)
  }

  gi <- GI(xml::XMLReader, paths = list(row = row, columns = columns))
  Input(files, gi, attributes)
}
