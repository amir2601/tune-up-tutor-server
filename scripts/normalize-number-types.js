/**
 * One-time / repeatable migration: normalise numeric fields that were stored as
 * strings (an older version of the app saved form values verbatim, e.g.
 * seats: "7" instead of seats: 7). MongoDB aggregation operators such as $inc
 * and the `$toInt` pipeline used by /booking-data expect real numbers, so this
 * converts any numeric-looking string to a number.
 *
 * Usage (from the server directory):
 *   node scripts/normalize-number-types.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tujztw6.mongodb.net/?retryWrites=true&w=majority`;

// collection -> numeric fields that must be stored as numbers
const targets = {
    classes: ['seats', 'students', 'price'],
    selectedClasses: ['seats', 'students', 'price'],
    enrolledClass: ['seats', 'students', 'price'],
    paymentInfo: ['price'],
};

async function run() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('tuneUpDb');

    let updated = 0;

    for (const [collection, fields] of Object.entries(targets)) {
        const col = db.collection(collection);

        for (const field of fields) {
            const docs = await col.find({ [field]: { $type: 'string' } }).toArray();

            for (const doc of docs) {
                const value = Number(doc[field]);

                if (!Number.isFinite(value)) {
                    console.warn(`Skipped non-numeric ${collection}.${doc._id}.${field}:`, doc[field]);
                    continue;
                }

                await col.updateOne({ _id: doc._id }, { $set: { [field]: value } });
                updated += 1;
                console.log(`Updated ${collection}.${doc._id}.${field}: "${doc[field]}" -> ${value}`);
            }
        }
    }

    console.log(`Done. Normalised ${updated} field(s).`);
    await client.close();
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
