/**
 * Japanese imperial era (gengō) table.
 * Maps romanized era name → first CE year of that era.
 * Includes Keichō (1596) through Reiwa (2019).
 * Pre-1596 eras and full ~250-entry historical list are deferred to v1.x.
 */
export const GENGO: Record<string, number> = {
  // Modern
  Reiwa:    2019,
  Heisei:   1989,
  Showa:    1926,   // Shōwa
  Taisho:   1912,   // Taishō
  Meiji:    1868,

  // Late Edo
  Keio:     1865,   // Keiō
  Genji:    1864,
  Bunkyu:   1861,   // Bunkyū
  Manen:    1860,   // Man'en
  Ansei:    1854,
  Kaei:     1848,
  Koka:     1844,   // Kōka
  Tempo:    1830,   // Tenpō (also Tenpo)
  Tenpo:    1830,
  Bunsei:   1818,
  Bunka:    1804,
  Kyowa:    1801,   // Kyōwa
  Kansei:   1789,
  Tenmei:   1781,
  Anei:     1772,   // An'ei
  Meiwa:    1764,
  Horeki:   1751,   // Hōreki
  Kanen:    1748,   // Kan'en
  Enkyo:    1744,   // Enkyō (1744 era; not the 1308 era)
  Kanpo:    1741,   // Kanpō
  Genbun:   1736,
  Kyoho:    1716,   // Kyōhō
  Shotoku:  1711,   // Shōtoku
  Hoei:     1704,   // Hōei
  Genroku:  1688,
  Jokyo:    1684,   // Jōkyō
  Tenna:    1681,   // Ten'na
  Enpo:     1673,   // Enpō
  Kanbun:   1661,
  Manji:    1658,
  Meireki:  1655,
  Keian:    1648,
  Shoho:    1644,   // Shōhō
  Kanei:    1624,   // Kan'ei
  Genna:    1615,
  Keicho:   1596,   // Keichō

  // Late Muromachi / Azuchi-Momoyama
  Bunroku:  1592,
  Tensho:   1573,   // Tenshō
  Genki:    1570,
  Eiroku:   1558,
  Koji:     1555,   // Kōji
  Tenbun:   1532,   // Ten'bun
  Kyoroku:  1528,   // Kyōroku
  Daiei:    1521,
  Eisho:    1504,   // Eishō
  Bunki:    1501,
  Meio:     1492,   // Meiō
};
