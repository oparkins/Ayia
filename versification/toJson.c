#include <stdio.h>
#include <sbook.h>

#include <canon.h>
#include <canon_null.h>   // null v11n system

#include <canon_leningrad.h>  // Leningrad Codex (WLC) v11n system
#include <canon_mt.h>   // Masoretic Text (MT) v11n system
#include <canon_kjva.h>   // KJV + Apocrypha v11n system
#include <canon_nrsv.h>   // NRSV v11n system
#include <canon_nrsva.h>  // NRSV + Apocrypha v11n system
#include <canon_synodal.h>  // Russian Synodal v11n system
#include <canon_synodalprot.h>  // Russian Synodal v11n system
#include <canon_vulg.h>   // Vulgate v11n system
#include <canon_german.h> // German v11n system
#include <canon_luther.h> // Luther v11n system
#include <canon_catholic.h> // Catholic v11n system (10 chapter Esther)
#include <canon_catholic2.h>  // Catholic2 v11n system (16 chapter Esther)
#include <canon_lxx.h>    // General LXX v11n system (includes GNT, as used in Orthodox Bibles)
#include <canon_orthodox.h> // Orthodox v11n system as used in Orthodox Bibles
#include <canon_segond.h> // French v11n system as used by Segond Bibles and its derivatives
#include <canon_calvin.h> // French v11n system
#include <canon_darbyfr.h>  // French v11n system based on John Darby's French translation


/**
 *  Convert Sword versification into a JSON object.
 *
 *  Based off the way Sword initializes its versification system:
 *    sword/src/mgr/versificationmgr.cpp
 *      getSystemVersificationMgr()
 *      loadFromSBook();
 *
 *  :NOTE: Currently we don't process `versification.mappings`
 */
int main( int argc, char* argv ) {
  struct versification vv[] = {
    // name           sbooks[]              sbooks[]          int[]       unsigned char[]
    {"KJV",          otbooks,              ntbooks,          vm},
    {"Leningrad",    otbooks_leningrad,    ntbooks_null,     vm_leningrad},
    {"MT",           otbooks_mt,           ntbooks_null,     vm_mt},
    {"KJVA",         otbooks_kjva,         ntbooks,          vm_kjva},
    {"NRSV",         otbooks,              ntbooks,          vm_nrsv,    mappings_nrsv},
    {"NRSVA",        otbooks_nrsva,        ntbooks,          vm_nrsva},
    {"Synodal",      otbooks_synodal,      ntbooks_synodal,  vm_synodal, mappings_synodal},
    {"SynodalProt",  otbooks_synodalProt,  ntbooks_synodal,  vm_synodalProt},
    {"Vulg",         otbooks_vulg,         ntbooks_vulg,     vm_vulg,    mappings_vulg},
    {"German",       otbooks_german,       ntbooks,          vm_german},
    {"Luther",       otbooks_luther,       ntbooks_luther,   vm_luther},
    {"Catholic",     otbooks_catholic,     ntbooks,          vm_catholic},
    {"Catholic2",    otbooks_catholic2,    ntbooks,          vm_catholic2},
    {"LXX",          otbooks_lxx,          ntbooks,          vm_lxx},
    {"Orthodox",     otbooks_orthodox,     ntbooks,          vm_orthodox},
    {"Calvin",       otbooks,              ntbooks,          vm_calvin,  mappings_calvin},
    {"DarbyFr",      otbooks,              ntbooks,          vm_darbyfr, mappings_darbyfr},
    {"Segond",       otbooks,              ntbooks,          vm_segond,  mappings_segond},
  };
  int vv_cnt  = sizeof(vv) / sizeof( vv[0] );
  int idex;

  printf("{\n");
  for (idex = 0; idex < vv_cnt; idex++) {
    struct versification  v_cur  = vv[idex];
    struct sbook*         bk;
    int*                  vm;
    unsigned char*        mappings;
    int                   vdex;
    int                   is_first  = 1;
    if (idex > 0) { printf(",\n"); }

    printf("  \"%s\": {", v_cur.name);

    // Access the maximum verses array for this entry
    vm = v_cur.vm;

    // Old Testament {
    bk = v_cur.ot;
    while (bk->chapmax > 0) {
      // A book in the Old Testament
      printf("\n    \"%s\": [ ", bk->osis);

      // Walk the maximum verses list, indexed by chapter# - 1
      for (vdex = 0; vdex < bk->chapmax; vdex++) {
        if (vdex % 10 == 0) {
          if (vdex > 0) { printf(",\n%13s", " "); }
        } else if (vdex > 0) {
          printf(", ");
        }
        printf("%3d", vm[vdex]);
      }

      printf(" ],");
      bk++;
    }

    // Old Testament }
    // New Testament {
    bk = v_cur.nt;
    is_first  = 1;
    while (bk->chapmax > 0) {
      // A book in the New Testament
      if (is_first) { is_first = 0; }
      else          { printf(","); }

      printf("\n    \"%s\": [", bk->osis);

      // Walk the maximum verses list, indexed by chapter# - 1
      for (vdex = 0; vdex < bk->chapmax; vdex++) {
        if (vdex % 10 == 0) {
          if (vdex > 0) { printf(",\n%13s", " "); }
        } else if (vdex > 0) {
          printf(", ");
        }
        printf("%3d", vm[vdex]);
      }

      printf(" ]");
      bk++;
    }
    // New Testament }

    printf("\n  }");
  }
  printf("\n}\n");
}
