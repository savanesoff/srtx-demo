import { useCallback, useEffect, useState } from "react"

export type UserType = {
    login: string,
    id: number,
    avatar_url: string,
    html_url: string,
    type: string,
    twitter_username: string,
    public_repos: number,
    followers: number,
    following: number,
    company: string,
    location: string,
    name: string,
    message?: string,
}

export type User = {
    info?: UserType,
    followers?: UserType[],
}

type Users = {
    [key: string]: User | null,
}

const PER_PAGE = 100;

/**
 * Fetches all followers of a user
 */
function fetchUserFollowersPage(name: string, page = 1): Promise<UserType[]> {
    return fetch(`https://api.github.com/users/${name}/followers?per_page=${PER_PAGE}&page=${page}`)
        .then(res => res.json())
        .then((data: UserType[] & { message: string }) => {
            if (data.length === PER_PAGE) {
                return fetchUserFollowersPage(name, page + 1).then(data2 => data.concat(data2));
            }
            if (data.message) {
                throw new Error(data.message);
            }
            return data;
        })
}

/**
 * Custom hook that fetches followers of all users and finds common followers
 * @returns {Object} - Object containing users, commonUsers, error, loading
 * @returns {Function} - appendUser - Adds a user to the list of users and fetches their followers
 * @returns {Function} - deleteUser - Deletes a user from the list of users
 * @returns {Object} - users - Object containing users and their followers
 * @returns {Array} - commonUsers - Array of followers that are following all users
 * @returns {String} - error - Error message
 * @returns {Boolean} - loading - Indicates if data is being fetched
 * @example const { appendUser, deleteUser, users, commonUsers, error, loading } = useGithub();
 */
export function useGithub() {
    const rnd = Math.random().toString(36).substring(7);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<Users>({
        // set default users
        'tumiduong': null,
        'mildlywilde': null,
    })
    const [commonUsers, setCommonUsers] = useState<UserType[]>([]);
    const [error, setError] = useState<string | null>(null)
    const [errorTimeout, setErrorTimeout] = useState<number>(0)


    // Finds followers that are following all users
    useEffect(() => {
        const userList: {
            [key: string]: {
                follower: UserType,
                count: number,
            }
        } = {};

        const userNames = Object.keys(users);
        userNames.forEach(name => {
            const followers = users[name]?.followers;
            if (!followers || followers.length === 0) {
                return;
            }

            followers.forEach((follower) => {
                const key = follower.id.toString();
                // find out if users have the same follower
                if (userList[key] === undefined) {
                    userList[key] = {
                        follower,
                        count: 1,
                    }
                } else {
                    userList[key].count++;
                }
            })
        })

        const commonUsers = Object.values(userList).filter(user => user.count === userNames.length).map(user => user.follower);
        setCommonUsers(commonUsers);
    }, [users, setCommonUsers])

    /**
     * Adds a user to the list of users and fetches their followers
     */
    const addUsername = useCallback((name: string): Promise<void> => {
        // set to null to indicate that user is defined
        // this however will not trigger a re-render, which is what we want
        users[name] = null;
        setUsers({ ...users })
        // find followers
        const followersOp = fetchUserFollowersPage(name)
            .then((data: UserType[]) => {
                users[name] = { ...users[name], followers: data };
            })

        const userOp = fetch(`https://api.github.com/users/${name}`)
            .then(res => res.json())
            .then((data: UserType) => {
                if (data.message) {
                    throw new Error(data.message);
                }
                users[name] = { ...users[name], info: data };
            })

        return Promise.all([followersOp, userOp]).catch((error) => {
            console.error(error);
            delete users[name];
            setError(error.message);
        }).then(() => {
            setUsers({ ...users })
        });

    }, [users, setUsers]);

    /**
     * Adds a user to the list of users and fetches their followers
     */
    const appendUser = useCallback((name: string) => {
        if (name.length === 0) {
            setError(`Username is empty`);
            return Promise.resolve();
        }

        if (users[name] !== undefined) {
            setError(`Username: "${name}" already exist`);
            return Promise.resolve();
        }
        setLoading(true);
        addUsername(name).finally(() => setLoading(false));
    }, [addUsername])

    /**
     * Deletes a user from the list of users
     */
    const deleteUser = useCallback((name: string) => {
        setLoading(true);
        delete users[name];
        setUsers({ ...users });
        setLoading(false);
    }, [users, setUsers])

    // clear error after 5 seconds
    useEffect(() => {
        if (!error) {
            return;
        }
        clearTimeout(errorTimeout)
        const timeout = setTimeout(() => setError(''), 5000);
        setErrorTimeout(timeout);
    }, [error])

    /**
     * Fetches followers of all users on initial load
     */
    useEffect(() => {
        if (initialized) {
            return;
        }
        setInitialized(true);
        setLoading(true);
        const promises = Object.keys(users).map(name => addUsername(name));
        Promise.all(promises).finally(() => setLoading(false));
    }, [initialized])

    return {
        appendUser,
        deleteUser,
        users,
        commonUsers,
        error,
        loading,
    }
}