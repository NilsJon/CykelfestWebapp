import _ from "underscore";

const Generator = (data) => {
    let groups = new Map();
    let all_groups = new Map();
    let possibleHosts = new Set();
    let previouslyMatchedWith = new Map();
    let visitedZones = new Map();
    let leftOverGroups = [];

    // #Hur många grupper som bara kommer besöka hem inom en stadszon under cykelfesten.
    // #Högre siffra innebär enklare att hitta lösning.
    let ALLOWED_ONE_ZONERS = Math.floor(data.length / 30);

    const getMealMatch = () => {
        let matches_dic = new Map();
        const nrofParticipants = Math.floor(groups.size / 3);
        const hosts = _.sample(Array.from(possibleHosts), nrofParticipants);
        let leftOverGroups = new Set();
        for (const key of groups.keys()) {
            if (!hosts.includes(key)) {
                leftOverGroups.add(key);
            }
        }
        let meal_matches = new Map();
        for (let host of hosts) {
            possibleHosts.delete(host);
            const couple1 = _.sample(Array.from(leftOverGroups));
            leftOverGroups.delete(couple1);
            const couple2 = _.sample(Array.from(leftOverGroups));
            leftOverGroups.delete(couple2);
            meal_matches.set(host, [couple1, couple2]);
            previouslyMatchedWith.get(host).concat([couple1, couple2]);
            previouslyMatchedWith.get(couple1).concat([host, couple2]);
            previouslyMatchedWith.get(couple2).concat([couple1, host]);
            const zone = groups.get(host).get("zone");
            visitedZones.get(host).push(zone);
            visitedZones.get(couple1).push(zone);
            visitedZones.get(couple2).push(zone);
            matches_dic.set(host, [couple1, couple2]);
        }
        console.log(leftOverGroups);
        return matches_dic;
    };

    const checkDuplicates = () => {
        for (const key of groups.keys()) {
            const listOfElems = previouslyMatchedWith.get(key);
            const duplicatesremoved = new Set(listOfElems);
            if (listOfElems.length !== duplicatesremoved.size) {
                return false;
            }
        }
        return true;
    };

    const checkZones = () => {
        let nrOfLuckyGroups = 0;
        for (const key of groups.keys()) {
            let listOfElems = new Set(visitedZones.get(key));
            //console.log(listOfElems);
            if (listOfElems.size === 1) {
                nrOfLuckyGroups += 1;
            }
        }
        return nrOfLuckyGroups < ALLOWED_ONE_ZONERS;
    };

    const removeExcessGroups = () => {
        let group_names = new Set(groups.keys());
        if (groups.size % 3 === 1) {
            let group1 = _.sample(Array.from(group_names));
            groups.delete(group1);
            return [group1];
        } else if (groups.size % 3 === 2) {
            let group1 = _.sample(Array.from(group_names));
            groups.delete(group1);
            group_names.delete(group1);
            let group2 = _.sample(Array.from(group_names));
            groups.delete(group2);
            return [group1, group2];
        } else {
            return [];
        }
    };

    const createGroups = (csv_data) => {
        for (let i = 0; i < csv_data.length; i++) {
            let row = csv_data[i];
            let group_name = row[1] + " & " + row[3];
            if (row[5] === "2") {
                row.splice(5, 0, "");
                row.splice(6, 0, "");
            }
            if (row[7] === "3") {
                group_name = group_name + " & " + row[5];
            }
            let group_zone = row[11];
            let group_info = new Map();
            group_info.set("zone", group_zone);
            group_info.set("foodpref", row[10]);
            group_info.set("address", row[8]);
            group_info.set("hostphone", row[9]);
            group_info.set("emails", row[2] + ", " + row[4]);
            group_info.set("sizeofparty", parseInt(row[7]));
            if (row[7] === 3) {
                group_info.set("emails", group_info.get("emails") + row[6]);
            }
            groups.set(group_name, group_info);
        }
    };

    const generateMap = () => {
        let m = new Map();
        for (const key of groups.keys()) {
            m.set(key, []);
        }
        return m;
    };

    const createCSVData = (matches) => {
        let result = [];
        let header = [
            "host",
            "GuestPair1",
            "GuestPair2",
            "Opt GuestPair3",
            "address",
            "Foodpref",
            "Host phone",
            "Host Email",
            "Size of parTY",
        ];
        result.push(header);
        for (const host of matches.keys()) {
            const guests = matches.get(host);
            const foodpref =
                all_groups.get(guests[0]).get("foodpref") +
                ", " +
                all_groups.get(guests[1]).get("foodpref");
            const nrOfGuests =
                all_groups.get(host).get("sizeofparty") +
                all_groups.get(guests[0]).get("sizeofparty") +
                all_groups.get(guests[1]).get("sizeofparty");
            let info = [
                host,
                guests[0],
                guests[1],
                "-",
                all_groups.get(host).get("address"),
                foodpref,
                all_groups.get(host).get("hostphone"),
                all_groups.get(host).get("emails"),
                nrOfGuests,
            ];
            if (guests.length === 3) {
                info[3] = guests[2];
                info[5] = foodpref + all_groups.get(guests[2]).get("foodpref");
                info[8] =
                    nrOfGuests + all_groups.get(guests[2]).get("sizeofparty");
            }
            result.push(info);
        }
        return result;
    };
    console.log("Starting generating");
    console.log(ALLOWED_ONE_ZONERS);
    createGroups(data);
    all_groups = new Map(groups);
    previouslyMatchedWith = generateMap();
    visitedZones = generateMap();
    leftOverGroups = removeExcessGroups();
    possibleHosts = new Set(Array.from(groups.keys()));
    for (let i = 0; i < 10000000; i++) {
        if (i % 100000 === 0) {
            console.log(
                "Iteration " + i + ". Fortsätter leta efter lösning..."
            );
            if (i % 400000 === 0) {
                ALLOWED_ONE_ZONERS += 1;
                console.log("minskar svårighet");
            }
        }
        let appetizer_matches = getMealMatch();
        let maincourse_matches = getMealMatch();
        let dessert_matches = getMealMatch();
        if (checkDuplicates() && checkZones()) {
            console.log("Found match");
            let app_keys = Array.from(appetizer_matches.keys());
            let main_keys = Array.from(maincourse_matches.keys());
            let des_keys = Array.from(dessert_matches.keys());
            leftOverGroups.map((leftover) => {
                appetizer_matches.get(_.sample(app_keys)).push(leftover);
                maincourse_matches.get(_.sample(main_keys)).push(leftover);
                dessert_matches.get(_.sample(des_keys)).push(leftover);
            });
            console.log("found matches");
            console.log(appetizer_matches);
            const csv_app = createCSVData(appetizer_matches);
            const csv_main = createCSVData(maincourse_matches);
            const csv_des = createCSVData(dessert_matches);
            return [csv_app, csv_main, csv_des];
        } else {
            previouslyMatchedWith = generateMap();
            visitedZones = generateMap();
            possibleHosts = new Set(Array.from(groups.keys()));
        }
    }
    return null;
};

export default Generator;
// let x = [
//     [
//         "4/18/2019 14:38:37",
//         "Alyssa Gibson",
//         "fake@email.com",
//         "Mark Hart",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Österort / East",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/18/2019 19:43:20",
//         "Amanda Williams",
//         "fake@email.com",
//         "Roger Gilbert",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Söderort / South",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/19/2019 9:20:21",
//         "Kevin Terry",
//         "fake@email.com",
//         "Renee Smith",
//         "fake@email.com",
//         "Angela Davis",
//         "fake@email.com",
//         "3",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Centralt / Central",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/17/2019 22:40:23",
//         "Michael Arias",
//         "fake@email.com",
//         "Blake Smith",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Söderort / South",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/28/2019 14:04:17",
//         "Jeremy Farmer",
//         "fake@email.com",
//         "Brenda Wilkinson",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Söderort / South",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/28/2019 21:05:21",
//         "Julia Thomas",
//         "fake@email.com",
//         "Ashley Nguyen",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/16/2019 20:28:01",
//         "Traci Martinez",
//         "fake@email.com",
//         "Carrie Mejia",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/17/2019 14:22:51",
//         "Kimberly Ramos",
//         "fake@email.com",
//         "Jason Phillips",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/17/2019 19:20:11",
//         "Daniel Miller",
//         "fake@email.com",
//         "Kimberly Webb",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/19/2019 14:00:33",
//         "Richard Hoover",
//         "fake@email.com",
//         "Angel Trujillo",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/24/2019 17:11:58",
//         "Timothy Johns",
//         "fake@email.com",
//         "Gail Ramirez",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Söderort / South",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/24/2019 20:29:14",
//         "Donald Rush",
//         "fake@email.com",
//         "Greg Morris",
//         "fake@email.com",
//         "Aaron Shelton",
//         "fake@email.com",
//         "3",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/18/2019 17:37:41",
//         "Christopher Ferguson",
//         "fake@email.com",
//         "Penny Bailey",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/24/2019 12:09:44",
//         "Christine Richardson",
//         "fake@email.com",
//         "Danny Martin",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/24/2019 15:11:56",
//         "Beverly Sullivan",
//         "fake@email.com",
//         "John Riley",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/23/2019 19:51:28",
//         "Jessica Hunter MD",
//         "fake@email.com",
//         "William Park",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/24/2019 10:55:45",
//         "Tim Dixon",
//         "fake@email.com",
//         "James Charles",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/26/2019 18:09:43",
//         "Catherine Larsen",
//         "fake@email.com",
//         "Christy Schmidt",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/28/2019 22:37:09",
//         "Kenneth Clay",
//         "fake@email.com",
//         "John Turner",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/19/2019 23:10:48",
//         "David Garrison",
//         "fake@email.com",
//         "Catherine Anderson",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/20/2019 16:49:48",
//         "Andrew Simpson",
//         "fake@email.com",
//         "Jessica Brown",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Söderort / South",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
//     [
//         "4/23/2019 22:17:25",
//         "Lisa West",
//         "fake@email.com",
//         "Cory Brown",
//         "fake@email.com",
//         "2",
//         "fakeaddress 123",
//         "0701234567",
//         "god mat",
//         "Norrort / North",
//         "Ja",
//         "Tjena",
//         "Ja\r",
//     ],
// ];
//Generator(x);
