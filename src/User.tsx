import { UserType } from "./useGithub";

interface User {
    data?: UserType;
    removable?: boolean;
    onRemove?: () => void;
}
export function User({
    data,
    removable = false,
    onRemove,
}: User) {
    const info = [
        data?.name ? `Name: ${data.name}` : '',
        data?.company ? `Company: ${data.company}` : '',
        data?.location ? `Location: ${data.location}` : '',
        data?.twitter_username ? `Twitter: ${data.twitter_username}` : '',
    ].filter(data => data).join('\n');

    return (
        <div className={'user'}  >
            <a className={'userData'} href={data?.html_url} target={'_blank'} title={info || data?.login}>
                <img src={data?.avatar_url} alt="avatar" className={'avatar'} />
                <span className={"username"}>{data?.login}</span>
                {data?.followers && <span className={'followCount'}> {data.followers} fans</span>}
            </a>
            {/* Enable delete */}
            {removable && <button className={'remove'} onClick={onRemove}>x</button>}
        </div>
    );
}