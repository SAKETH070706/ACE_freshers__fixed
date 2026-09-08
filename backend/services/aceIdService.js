import AceIdConfig from "../models/AceIdConfig.js";


const LETTERS = ["A", "B", "C", "D"];


/* =========================================================
   Generate a random frequency between 1 and 20
========================================================= */

const randomFrequency = () => {

    return Math.floor(Math.random() * 20) + 1;

};


/* =========================================================
   Get or create ACE ID configuration
========================================================= */

const getAceIdConfig = async () => {

    let config =
        await AceIdConfig.findOne({
            name: "aceIdConfig",
        });


    /*
        First ever registration.

        Frequencies are generated ONCE
        and stored permanently in MongoDB,
        then extended dynamically on each batch exhaustion.
    */

    if (!config) {

        try {
            config = await AceIdConfig.create({

                name: "aceIdConfig",

                frequencies: {
                    A: randomFrequency(),
                    B: randomFrequency(),
                    C: randomFrequency(),
                    D: randomFrequency(),
                },

                counters: {
                    A: 0,
                    B: 0,
                    C: 0,
                    D: 0,
                },

                currentLetter: "A",

            });
        } catch (err) {
            // If another concurrent request created the config first
            if (err.code === 11000) {
                config = await AceIdConfig.findOne({
                    name: "aceIdConfig",
                });
            } else {
                throw err;
            }
        }

    }


    return config;

};


/* =========================================================
   Generate ACE ID
========================================================= */

export const generateAceId = async () => {

    /*
        We use a retry loop because multiple EBMs
        can register at almost the same time.

        MongoDB's findOneAndUpdate() + $inc
        gives us atomic counter allocation.
    */

    while (true) {

        const config =
            await getAceIdConfig();


        const currentLetter =
            config.currentLetter;


        const currentCount =
            config.counters[currentLetter];


        const frequency =
            config.frequencies[currentLetter];


        /*
            If the current letter has already completed
            its frequency, move to the next letter.

            This update is also atomic because the
            currentLetter is included in the filter.
        */

        if (currentCount >= frequency) {

            const currentIndex =
                LETTERS.indexOf(currentLetter);


            const nextIndex =
                (currentIndex + 1) %
                LETTERS.length;


            const nextLetter =
                LETTERS[nextIndex];


            const newFrequency =
                frequency + randomFrequency();

            const switched =
                await AceIdConfig.findOneAndUpdate(
                    {
                        name: "aceIdConfig",

                        currentLetter:
                            currentLetter,

                        [`counters.${currentLetter}`]:
                            {
                                $gte: frequency,
                            },
                    },
                    {
                        $set: {
                            currentLetter:
                                nextLetter,

                            [`frequencies.${currentLetter}`]:
                                newFrequency,
                        },
                    },
                    {
                        new: true,
                    }
                );


            /*
                Another registration may have
                changed the letter before us.

                Retry from the beginning.
            */

            if (!switched) {
                continue;
            }


            continue;

        }


        /*
            ATOMIC COUNTER INCREMENT

            The filter makes sure that:

            1. We are still on the same letter.
            2. The counter has not already reached
               its frequency.

            $inc guarantees that two simultaneous
            registrations cannot receive the same
            counter value.
        */

        const updated =
            await AceIdConfig.findOneAndUpdate(
                {
                    name: "aceIdConfig",

                    currentLetter:
                        currentLetter,

                    [`counters.${currentLetter}`]:
                        {
                            $lt: frequency,
                        },
                },
                {
                    $inc: {
                        [`counters.${currentLetter}`]:
                            1,
                    },
                },
                {
                    new: true,
                }
            );


        /*
            Another registration won the race.

            Retry and obtain the next available number.
        */

        if (!updated) {
            continue;
        }


        /*
            Read the counter allocated by THIS
            atomic update.

            Example:

            previous = 6
            $inc → 7

            Therefore this registration owns A007.
        */

        const allocatedCount =
            updated.counters[currentLetter];


        /*
            Build ACE ID.
        */

        const aceId =
            `26ACM${currentLetter}${String(
                allocatedCount
            ).padStart(3, "0")}`;


        /*
            Return the ID immediately.

            The counter has already been persisted
            atomically in MongoDB.
        */

        return aceId;

    }

};