// Initial Default Data
const defaultData = {
    lastUpdated: 0,
    gallery: [
        {
            id: 1,
            title: "ত্রাণ বিতরণ কার্যক্রম",
            category: "relief",
            image: "images/gallery/ত্রাণ বিতরণ কার্যক্রম/relief.jpg"
        },
        {
            id: 2,
            title: "খাদ্য সহায়তা প্রকল্প",
            category: "food",
            image: "images/gallery/খাদ্য সহায়তা প্রকল্প/food.jpg"
        },
        {
            id: 3,
            title: "যেকোনো মূল্যের খাবার",
            category: "any_food",
            image: "images/gallery/যেকোনো মূল্যের খাবার/any_food.jpg"
        }
    ],
    members: [
        {
            id: "HS-001",
            name: "আহমেদ হাসিব",
            position: "ফাউন্ডার ও প্রেসিডেন্ট",
            org: "Helpful Squad & Freedom Foundation",
            date: "মার্চ ২০২০",
            pic: "images/members/hasib.jpg",
            status: "Active"
        },
        {
            id: "FF-001",
            name: "তানভীর হাসান",
            position: "কো-অর্ডিনেটর",
            org: "Helpful Squad & Freedom Foundation",
            date: "জুন ২০২১",
            pic: "images/members/Annotation 2025-10-27 201143.jpg",
            status: "Active"
        },
        {
            id: "HS-005",
            name: "সুমাইয়া জান্নাত",
            position: "ভলান্টিয়ার",
            org: "Helpful Squad & Freedom Foundation",
            date: "আগস্ট ২০২৩",
            pic: "images/members/sumaiya.jpg",
            status: "Active"
        }
    ],
    donations: [
        { name: "মামুনুর রশীদ", method: "বিকাশ", amount: 500, date: "২২ ফেব্রুয়ারি, ২০২৬" }
    ],
    projects: [
        {
            id: 1,
            title: "শীতবস্ত্র বিতরণ ২০২৪",
            target: 50000,
            raised: 35000,
            status: "Running"
        },
        {
            id: 2,
            title: "বন্যা পুনর্বাসন প্রকল্প",
            target: 100000,
            raised: 25000,
            status: "Running"
        }
    ],
    categories: [
        { id: 'food', name: 'খাদ্য সহায়তা প্রকল্প', color: 'purple' },
        { id: 'relief', name: 'ত্রাণ বিতরণ কার্যক্রম', color: 'blue' },
        { id: 'any_food', name: 'যেকোনো মূল্যের খাবার', color: 'green' }
    ],
    settings: {
        projectMessage: "",
        auth: {
            username: "admin",
            password: "1234",
            recoveryEmail: "admin@example.com"
        }
    },
    complaints: []
};

// Data Controller
const AppData = {
    // Helper to get category mapping as object
    getCategoryMap: function () {
        const cats = this.get('categories') || defaultData.categories;
        const map = {};
        cats.forEach(c => map[c.id] = c.name);
        return map;
    },
    // এখানে আপনার গুগল শিটের 'Web App URL' টি সেভ হবে
    getRemoteUrl: function () {
        return localStorage.getItem('hsff_cloud_url') || "https://script.google.com/macros/s/AKfycbzburnt8a8wnTqYpAeuf4P6cXXeM2IeEluUjbEaNOc9GvyB5TNUnDM1niL4_cZdUYrL/exec";
    },

    setRemoteUrl: function (url) {
        localStorage.setItem('hsff_cloud_url', url);
    },

    get: function (key) {
        const stored = localStorage.getItem('hsff_' + key);
        return (stored && stored !== "undefined") ? JSON.parse(stored) : defaultData[key];
    },

    set: function (key, data, updateTimestamp = true) {
        try {
            localStorage.setItem('hsff_' + key, JSON.stringify(data));
            if (updateTimestamp && key !== 'lastUpdated') {
                this.set('lastUpdated', Date.now(), false);
            }
        } catch (e) {
            console.error("Storage Error:", e);
            if (e.name === 'QuotaExceededError') {
                alert("স্টোরেজ ফুল হয়ে গেছে! দয়া করে কিছু বড় ছবি ডিলিট করুন অথবা পিসি মোড ব্যবহার করুন।");
            }
        }
    },

    addItem: function (key, item) {
        let data = this.get(key) || [];
        data.push(item);
        this.set(key, data);
    },

    removeItem: function (key, id) {
        let data = this.get(key) || [];
        // Support both numeric and string IDs
        const filtered = data.filter(item => String(item.id) !== String(id));
        this.set(key, filtered);
    },

    // পুরো ডাটা ক্লাউডে সেভ করার ফাংশন
    saveToCloud: async function () {
        const url = this.getRemoteUrl();
        if (!url) return { success: false, message: "Cloud URL নট ফাউন্ড!" };

        const fullData = {
            lastUpdated: this.get('lastUpdated'),
            gallery: this.get('gallery'),
            members: this.get('members'),
            donations: this.get('donations'),
            projects: this.get('projects'),
            settings: this.get('settings'),
            complaints: this.get('complaints'),
            categories: this.get('categories')
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires this for simple POST
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(fullData)
            });
            return { success: true, message: "ক্লাউডে সেভ হয়েছে!" };
        } catch (err) {
            return { success: false, message: "সেভ ব্যর্থ হয়েছে: " + err.message };
        }
    },

    // ক্লাউড থেকে ডাটা নিয়ে আসার ফাংশন
    loadFromCloud: async function (force = false) {
        const url = this.getRemoteUrl();
        if (!url) return { success: false, message: "Cloud URL পাওয়া যায়নি!" };

        try {
            const response = await fetch(url);
            const cloudData = await response.json();

            if (cloudData && typeof cloudData === 'object') {
                const localTS = this.get('lastUpdated') || 0;
                const cloudTS = cloudData.lastUpdated || 0;

                // Only overwrite if cloud data is newer or forced
                if (!force && cloudTS <= localTS && localTS !== 0) {
                    console.log("Local data is up to date or newer. Skipping load.");
                    return { success: true, message: "লোকাল ডাটা ব্যবহার করা হচ্ছে।" };
                }

                Object.keys(cloudData).forEach(key => {
                    this.set(key, cloudData[key], false); // Don't update timestamp when loading from cloud
                });
                return { success: true, message: "ডাটাবেস আপডেট হয়েছে!" };
            }
            return { success: false, message: "ক্লাউড থেকে ভুল ডাটা পাওয়া গেছে।" };
        } catch (err) {
            console.error("Cloud load error:", err);
            return { success: false, message: "লোড ব্যর্থ হয়েছে: " + err.message };
        }
    }
};
