export interface AllowanceEntry {
  type: string;
  ia_rate: number;
  aa_rate: number;
}

export interface AllowanceClass {
  name: string;
  entries: Partial<Record<string, AllowanceEntry>>;
}

export interface AllowanceGroup {
  name: string;
  classes: Record<string, AllowanceClass>;
}

export const ALLOWANCE_GROUPS: Record<string, AllowanceGroup> = {
  "B": {
    "name": "Agriculture",
    "classes": {
      "1": {
        "name": "Qualifying agriculture expenditure",
        "entries": {
          "a": { "type": "Clearing and preparation of land for the purposes of agriculture", "ia_rate": 0, "aa_rate": 50 },
          "b": { "type": "Planting (but not replanting) of crops on land cleared for planting", "ia_rate": 0, "aa_rate": 50 },
          "c": { "type": "Construction on a farm of a road or bridge", "ia_rate": 0, "aa_rate": 50 }
        }
      },
      "2": {
        "name": "Construction of a building for the welfare of persons or as living accommodation for persons, employed in or in connection with the working of that farm",
        "entries": {
          "-": { "type": "Construction of a building for the welfare of persons or as living accommodation for persons, employed in or in connection with the working of that farm", "ia_rate": 0, "aa_rate": 20 }
        }
      },
      "3": {
        "name": "Buildings",
        "entries": {
          "a": { "type": "Office", "ia_rate": 0, "aa_rate": 10 },
          "b": { "type": "Building for the purpose of working the farm", "ia_rate": 0, "aa_rate": 10 }
        }
      }
    }
  },
  "C": {
    "name": "Forest",
    "classes": {
      "1": {
        "name": "Expenditure for the purpose of a business which consists wholly or partly of the extraction of timber from the forest",
        "entries": {
          "a": { "type": "Road", "ia_rate": 0, "aa_rate": 10 },
          "b": { "type": "Building", "ia_rate": 0, "aa_rate": 10 }
        }
      },
      "2": {
        "name": "Expenditure for for the welfare of persons employed in or in connection with the extraction of timber from the forest",
        "entries": {
          "a": { "type": "Building", "ia_rate": 0, "aa_rate": 20 },
          "b": { "type": "Living accomodation", "ia_rate": 0, "aa_rate": 20 }
        }
      }
    }
  },
  "D": {
    "name": "Industrial Buildings",
    "classes": {
      "1": {
        "name": "Common Industrial Building",
        "entries": {
          "a": { "type": "Factory", "ia_rate": 10, "aa_rate": 3 },
          "b": { "type": "Dock, wharf, jetty or other similar building", "ia_rate": 10, "aa_rate": 3 },
          "c": { "type": "Warehouse (with factory)", "ia_rate": 10, "aa_rate": 3 },
          "d": { "type": "Supply of water, electricity and telecommunication services", "ia_rate": 10, "aa_rate": 3 },
          "e": { "type": "Agriculture", "ia_rate": 10, "aa_rate": 3 },
          "f": { "type": "Mining", "ia_rate": 10, "aa_rate": 3 },
          "g": { "type": "Canteen, rest-room, recreation room, lavatory, bathroom, bathroom or washroom (with industrial building)", "ia_rate": 10, "aa_rate": 3 },
          "h": { "type": "Building for the welfare or living accommodation", "ia_rate": 10, "aa_rate": 3 },
          "i": { "type": "Private hospital", "ia_rate": 10, "aa_rate": 3 },
          "j": { "type": "Nursing home", "ia_rate": 10, "aa_rate": 3 },
          "k": { "type": "Maternity home", "ia_rate": 10, "aa_rate": 3 },
          "l": { "type": "Building for the purpose of approved research", "ia_rate": 10, "aa_rate": 3 },
          "m": { "type": "Building for use in approved service project", "ia_rate": 10, "aa_rate": 3 },
          "n": { "type": "Hotel registered with Ministry of Tourism", "ia_rate": 10, "aa_rate": 3 },
          "o": { "type": "Airport", "ia_rate": 10, "aa_rate": 3 },
          "p": { "type": "Motor racing circuit", "ia_rate": 10, "aa_rate": 3 },
          "q": { "type": "Public road and ancillary structures (toll collection)", "ia_rate": 10, "aa_rate": 6 },
          "r": { "type": "Old folks care centre", "ia_rate": 0, "aa_rate": 10 }
        }
      },
      "2": {
        "name": "Other Industrial Buildings",
        "entries": {
          "a": { "type": "Warehouse for purpose of storage of goods for exports or imported goods to be processed and distributed or re-exported", "ia_rate": 0, "aa_rate": 10 },
          "b": { "type": "Living accommodation (Manufacturing, Hotel, Tourism, Approved service project)", "ia_rate": 0, "aa_rate": 10 },
          "c": { "type": "Child care facilities", "ia_rate": 0, "aa_rate": 10 },
          "d": { "type": "Building for: School, Educational institution", "ia_rate": 0, "aa_rate": 10 },
          "e": { "type": "Building: Industrial training, Technical training, Vocational training", "ia_rate": 0, "aa_rate": 10 }
        }
      },
      "3": {
        "name": "Living accommodation with industrial building",
        "entries": {
          "-": { "type": "Building constructed for use as living accommodation of employed individuals (with industrial building)", "ia_rate": 40, "aa_rate": 3 }
        }
      },
      "4": {
        "name": "Build-Lease-Transfer to Government",
        "entries": {
          "-": { "type": "Building constructed under an approved build-lease-transfer agreement with the Government", "ia_rate": 10, "aa_rate": 6 }
        }
      },
      "5": {
        "name": "Privatisation and Private Financing Initiatives",
        "entries": {
          "-": { "type": "Building under privatisation project and private financing initiatives", "ia_rate": 10, "aa_rate": 6 }
        }
      },
      "6": {
        "name": "Approved Kindergartens",
        "entries": {
          "-": { "type": "Building for the provision and maintenance of approved kindergartens", "ia_rate": 0, "aa_rate": 10 }
        }
      },
      "7": {
        "name": "Registered Child Care Centers",
        "entries": {
          "-": { "type": "Building for a registered child care center", "ia_rate": 0, "aa_rate": 10 }
        }
      }
    }
  },
  "E": {
    "name": "Plant and Machinery",
    "classes": {
      "1": {
        "name": "Heavy machinery / motor vehicle",
        "entries": {
          "a": { "type": "General", "ia_rate": 20, "aa_rate": 20 },
          "b": { "type": "Building and construction industry", "ia_rate": 30, "aa_rate": 20},
          "c": { "type": "Timber industry", "ia_rate": 60, "aa_rate": 20},
          "d": { "type": "Tin mining industry", "ia_rate": 60, "aa_rate": 20},
          "e": { "type": "Imported heavy machinery", "ia_rate": 10, "aa_rate": 10 },
          "f": { "type": "Heavy machinery / motor vehicle subject to Paragraph 2A & 2C Schedule 3", "ia_rate": 0, "aa_rate": 20 }
        }
      },
      "2": {
        "name": "Plant and machinery",
        "entries": {
          "a": { "type": "General", "ia_rate": 20, "aa_rate": 14 },
          "b": { "type": "Building and construction industry", "ia_rate": 30, "aa_rate": 14},
          "c": { "type": "Timber industry", "ia_rate": 60, "aa_rate": 14},
          "d": { "type": "Tin mining industry", "ia_rate": 60, "aa_rate": 14},
          "e": { "type": "Plant and machinery subject to Paragraph 2A & 2C Schedule 3", "ia_rate": 0, "aa_rate": 14 }
        }
      },
      "3": {
        "name": "Others",
        "entries": {
          "a": { "type": "General", "ia_rate": 20, "aa_rate": 10 },
          "b": { "type": "Building and construction industry", "ia_rate": 30, "aa_rate": 10},
          "c": { "type": "Timber industry", "ia_rate": 60, "aa_rate": 10},
          "d": { "type": "Tin mining industry", "ia_rate": 60, "aa_rate": 10},
          "e": { "type": "Plant and machinery subject to Paragraph 2A & 2C Schedule 3", "ia_rate": 0, "aa_rate": 10 }
        }
      },
      "4": {
        "name": "Special / specific purpose plant and machinery / equipment",
        "entries": {
          "a": { "type": "Storage, treatment and disposal of scheduled wasted; and recycling of wastes", "ia_rate": 40, "aa_rate": 20},
          "b": { "type": "Natural gas refuelling", "ia_rate": 40, "aa_rate": 20},
          "c": { "type": "Control of wastes and pollution of environment", "ia_rate": 40, "aa_rate": 20 },
          "d": { "type": "Special plant and machinery subject to provisions under paragraphs 2A & 2C Schedule 3", "ia_rate": 0, "aa_rate": 20 },
          "e": { "type": "Purposes of a qualifying project under Schedule 7A", "ia_rate": 40, "aa_rate": 20 },
          "f": { "type": "New bus", "ia_rate": 20, "aa_rate": 80 },
          "g": { "type": "Plant and machinery", "ia_rate": 20, "aa_rate": 40 }
        }
      },
      "5": {
        "name": "Computer and ICT equipment",
        "entries": {
          "a": { "type": "Information and communication technology equipment", "ia_rate": 20, "aa_rate": 80 }
        }
      },
      "6": {
        "name": "Small value assets",
        "entries": {
          "-": { "type": "refer to Public Ruling No. 10/2014 dated 31 December 2014", "ia_rate": 100, "aa_rate": 0 }
        }
      }
    }
  }
};