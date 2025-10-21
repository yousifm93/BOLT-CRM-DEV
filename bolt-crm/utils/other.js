export const isFilePath = (path) => {
    let rs = false;
    try {
        if (!path) {
            return rs;
        }

        if (typeof path !== 'string' || !path.trim()) {
            return rs;
        };

        // Trim trailing slashes
        const cleanPath = path.trim().replace(/[/\\]+$/, '');

        // Check if the path ends with a file extension
        rs = /\.[a-zA-Z0-9]{1,5}$/.test(cleanPath);

        return rs;
    } catch (error) {
        return rs;
    }
};

export const isAuthPath = (path) => {
    try {
        if (!path) {
            console.log('isAuthPath no path');
            return false;
        }

        if (typeof path !== 'string' || !path.trim()) {
            console.log('isAuthPath invalid path');
            return false;
        }

        const cleanPath = path.trim().replace(/[/\\]+$/, '');

        // Define auth paths
        const authPaths = ['/auth/signin', '/auth/signup', '/auth/verify', '/auth/reset'];
        return authPaths.includes(cleanPath);

    } catch (error) {
        console.log('isAuthPath error ==> ', error);
        return false;
    }
}


export const makeFirstLetterUppercase = (str) => {
    try {
        if (!str || typeof str !== 'string') return str;
        let s = str.trim();
        s = s.replace(/\s+/g, ' '); // replace multiple spaces with single space
        s = s.charAt(0).toUpperCase() + s.slice(1);
        s = s.replace(/-/g, ' '); // replace dashes with spaces
        return s;
    } catch (error) {
        console.log('makeFirstLetterUppercase error ==> ', error);
        return str;
    }
}

export const dashToKebab = (str) => {
    try {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/[-\s]+/g, '-').toLowerCase();
    } catch (error) {
        console.log('dashToKebab error ==> ', error);
        return str;
    }
}

export const kebabToCamel = (str) => {
    // example: 'pre-qualified' => 'preQualified'
    try {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/-([a-z])/g, (match, char) => char.toUpperCase());
    } catch (error) {
        console.log('kebabToCamel error ==> ', error);
        return str;
    }
}

export const camelToDisplay = (str) => {
    // example: 'preQualified' => 'Pre Qualified'
    try {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, c => c.toUpperCase());
    } catch (error) {
        console.log('camelToDisplay error ==> ', error);
        return str;
    }
}

export const toDisplayStr = (value) => {
    try {
        if (!value || typeof value !== 'string') return value;

        // Enhanced camel case handling that works with acronyms and numbers
        value = value
            // Insert space before capital letters (camelCase)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            // Insert space after acronyms followed by lowercase
            .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1 $2')
            // Handle numbers
            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
            .replace(/(\d)([a-zA-Z])/g, '$1 $2');

        // Convert kebab-case and snake_case to spaces
        value = value.replace(/[_-]/g, ' ');

        // Clean up multiple spaces and trim
        value = value.replace(/\s+/g, ' ').trim();

        if (!value) return value;

        // Capitalize first letter of each word
        value = value.replace(/\b\w/g, char => char.toUpperCase());

        return value;
    } catch (error) {
        console.log('toDisplayString error ==> ', error);
        return value;
    }
}

export const getFirstLettersFromArray = (arr) => {
    try {
        if (!Array.isArray(arr) || arr.length === 0) return '';
        return arr.map(item => {
            if (typeof item === 'string' && item.trim()) {
                return item.trim().charAt(0).toUpperCase();
            }
            return '';
        }).join('');
    } catch (error) {
        console.log('getFirstLettersFromArray error ==> ', error);
        return '';
    }
}

export const displayDate = (dateStr) => {
    // conver timestamp to Aug 23, 2023
    // conver ISO 8601 string to Aug 23, 2023
    try {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.log('displayDate error ==> ', error);
        return dateStr;
    }
}


export const formatCurrency = (amount) => {
    try {
        if (!amount && amount !== 0) return 'n/a';
        
        // Convert to number if it's a string
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        // Check if it's a valid number
        if (isNaN(numAmount)) return 'n/a';
        
        // Format with dollar sign and comma separators using US locale
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount);
        
    } catch (error) {
        console.log('formatCurrency error ==> ', error);
        return amount;
    }
}

export const formatPhoneNumber = (phone) => {
    try {
        if (!phone) return 'n/a';
        
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Handle different phone number lengths
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            // US number with country code: +1 (XXX) XXX-XXXX
            const areaCode = cleaned.slice(1, 4);
            const first = cleaned.slice(4, 7);
            const second = cleaned.slice(7, 11);
            return `+1 (${areaCode}) ${first}-${second}`;
        } else if (cleaned.length === 10) {
            // US number without country code: (XXX) XXX-XXXX
            const areaCode = cleaned.slice(0, 3);
            const first = cleaned.slice(3, 6);
            const second = cleaned.slice(6, 10);
            return `(${areaCode}) ${first}-${second}`;
        }
        
        // Return original if it doesn't match expected formats
        return phone;
        
    } catch (error) {
        console.log('formatPhoneNumber error ==> ', error);
        return phone || 'n/a';
    }
}

export const processEmailBody = ({ body, contact }) => {
    try {
        if (!body || typeof body !== 'string') return body || '';
        if (!contact || typeof contact !== 'object') return body;

        return body.replace(/\{\{contact\.(\w+)\}\}/g, (match, key) => {
            return contact.hasOwnProperty(key) ? String(contact[key] || '') : match;
        });

    } catch (error) {
        console.error('Error processing email body:', error);
        return body;
    }
}