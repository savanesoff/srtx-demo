import { useState, KeyboardEvent } from "react";
import { UserType } from "./useGithub";

interface User {
    data?: UserType;
    removable?: boolean;
    onRemove?: () => void;
    onEdit: (name: string) => void;
}
export function User({
    data,
    removable = false,
    onRemove,
    onEdit,
}: User) {
    const [editUser, setEditUser] = useState(false);

    const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        setEditUser(false);
        onEdit(event.currentTarget.value);
    }

    const info = [
        data?.name ? `Name: ${data.name}` : '',
        data?.company ? `Company: ${data.company}` : '',
        data?.location ? `Location: ${data.location}` : '',
        data?.twitter_username ? `Twitter: ${data.twitter_username}` : '',
    ].filter(data => data).join('\n');

    return (
        <>
            {editUser && <input type="text"
                placeholder="Enter Username"
                autoFocus={true}
                onKeyDownCapture={onKey}
                onBlur={() => setEditUser(false)} />}
            {!editUser && <div className={'user'}  >
                <a className={'userData'} href={data?.html_url} target={'_blank'} title={info || data?.login}>
                    <img src={data?.avatar_url} alt="avatar" className={'avatar'} />
                    <span className={"username"}>{data?.login}</span>
                    {data?.followers && <span className={'followCount'}> {data.followers} fans</span>}
                </a>
                <div className="controls">
                    {<button className={'remove'} onClick={() => setEditUser(true)}>Edit</button>}
                    {/* Enable delete */}
                    {removable && <button className={'remove'} onClick={onRemove}>x</button>}
                </div>
            </div>}
        </>
    );
}