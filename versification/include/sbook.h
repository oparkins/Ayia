#ifndef SBOOK_H
#define SBOOK_H

// Used within Sword headers
#define SWORD_NAMESPACE_START
#define SWORD_NAMESPACE_END

// From sword/include/versificationmgr.h
struct abbrev {
  const char* ab;
  const char* osis;
};

struct sbook {
  const char*   name;
  const char*   osis;
  const char*   prefAbbrev;
  unsigned char chapmax;
  int*          versemax;
};

/* From sword/src/mgr/versificationmgr.cpp
 *    registerVersificationSystem();
 */
struct versification {
  const char*     name;
  struct sbook*   ot;
  struct sbook*   nt;
  int*            vm;
  unsigned char*  mappings;
};
#endif  // SBOOK_H
