import type { WalletName } from '@solarti/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletAdapterNetwork,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solarti/wallet-adapter-base';
import type { Transaction } from '@solarti/web3.js';
import { PublicKey } from '@solarti/web3.js';
import type { default as Qtware, QtwareWallet } from 'qtware-adapter-sdk';

interface QtwareWindow extends Window {
    qtware?: QtwareWallet;
}

declare const window: QtwareWindow;

export interface QtwareWalletAdapterConfig {
    network?: WalletAdapterNetwork;
}

export const QtwareWalletName = 'Qtware' as WalletName<'Qtware'>;

export class QtwareWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = QtwareWalletName;
    url = 'https://app.arcaps.com';
    // MI, blue eye
    // icon =
    //     'data:image/png;base64,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';

    // MI: QinTong
    icon =
        'data:image/png;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPiAgPGltYWdlIGlkPSJpbWFnZTAiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB4PSIwIiB5PSIwIgogICAgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFnQUFBQUlBQ0FJQUFBQjdHa090QUFBQUlHTklVazBBQUhvbUFBQ0FoQUFBK2dBQUFJRG8KQUFCMU1BQUE2bUFBQURxWUFBQVhjSnk2VVR3QUFBQUdZa3RIUkFEL0FQOEEvNkM5cDVNQUFBQUpjRWhaY3dBQURzTUFBQTdEQWNkdgpxR1FBQUFDS2VsUllkRkpoZHlCd2NtOW1hV3hsSUhSNWNHVWdPR0pwYlFBQUNKbEZqVkVPd3pBSVEvODV4WTRBaGpUa09DTnRwSDdzCi9yOXpPMmtGV1JpZWtDWHIvTWpycmd6eERNU0lYWVA5TDB5YmF1MU42MVpvMGJuamh5NWRteDkwNlhDbFhEaTJ5OTVvRVpVYkwwNFkKUGxCa1Nla1RpUFlFbWhhc09yUUVvNGVsSGpWWFJ1UFB2cUgzdWVRTFRZZ29UTHNSWjdBQUFBQi9kRVZZZEZKaGR5QndjbTltYVd4bApJSFI1Y0dVZ2FYQjBZd0FLYVhCMFl3b2dJQ0FnSUNBME5Bb3hZekF4TldFd01EQXpNV0l5TlRRM01XTXdNakF3TURBd01qQXdNREl4Cll6QXlNMlV3TURBNE16SXpNRE15TXpNek1ETTJNekF6TWpGak1ESXpaakF3TUdJek1UTTJNek1LTXpJek5ETTVNbUl6TURNNE16QXoKTUFvT2pMelNBQUFEdUhwVVdIUlNZWGNnY0hKdlptbHNaU0IwZVhCbElIaHRjQUFBV0lYdFdjc1NvemdNdlBzcjVoT01aRXY0YzBpQQoyMWJ0Y1Q1L3V1VzhnR1EzTzN1YklsUUlzZVZXU3kwWktray8vL283L2NCTGkrZWtWMTE5OUd5RHFWMnNlcEZzWXRYY21pMDZpeXpyCjVYSlpSVERlckhDa3V0WXlheTZ6NTZLd0hhMmxNdnJrV0ZqVnA3TFVZdmdFb0NvV2llaXFpMlM5K3FpVGo0YUZOdE9aRFpMNTNhNjIKdUhJdTBRUFlGRnZKUTZjKzhUQVBKazhZakYyQzAxam1tb1Y4VnRJUWhHYXlhSTYzM0x3TFlFMm5LcVVVMjNudWMzUStlc0dSZFlLegoxVDA1WHJJNHJHUUpkSmRWQjIwOGNKVlZjQmFjNXc2Q1QzVmtqM3g5bEprT09KMjJMRUFCbVVTZXhGb0UwaEF5TE83elNJTEFIY0ltCnF4NTI1NXNpSTBqeEc3b1pDOFN1VDZhMHc3bGlZV1VXeVF0OEVJRXNTUjhKZmRXQWlTMHpKRDdBUnlqTFV4NWNJK0UySjNnZUVXM3UKdUVnNUJtMStBNjVlU25YclFSM0IwenYwSXpncjBKRTEyS3hWSW85ckJJNXlKTHpWeERpWjlYZkJmUitZckdudit3Q1owUUFyOUFPcgp1UG9BL3ltMHcvS3RxOUI1TWdzOVoxQXB2VVVhdjZCTmtRRWpCN1RzbmRsTnZhbHdTZXV0RE50cm9YUDFSeG1rMGtyb29GSndxT3FJCnJsYUZIYzZDK29aTVpjQ0JydFlHQzFEUkFodmpMRWE1RW5xbWcrZWRwN3VqVFdPSFRXd3FqeHltbHlReVp1RGpEWGNXL1lWbERReGMKWnEwNEN2b1BTY0JJWmRlRmxXRVVudEg5TUdpWUhMUWUyTEU1bGUxcFMxVE1qVjIzZ1RTdHMwSnJXd0s2Y1JORHJKVSs0bHJCb0lSZgpqR0dFUmdPdTZOMnh6R0hUd0dZTWRsR0Y2Vlo2VTJISFZ3cEpTU3V6c05xVi9zdXpQSEk5bGtXT1hRUk5pejFhc04vRm50MzNtVENTCjlnd1VibVpqN3pjelIzamhybmF0dVdNeGdzVDRRQnBmYTBHZXNPY2daMk9jQjdsZ2ZJd2M1QTNzazMyOXc2WXQ3aHRZVnRNVWVuMkMKamYwOVJYMFFjM2hQK1Z2R3ZTQ1BqVG54L29ER1JlSnYrZWtPOUhHTGVDMFQzdGVpVG1EdWJYY1BRZDM0c0IwRGNJUGI1eFkzY1YrQwpBQVYzRVlTRHhKVm9XV3IydmVCYnZkTkI4QmQveHFXc2FqcnA5NDExYitNT0cxRDRkOVhxTFozMW9OcXJ5MkQwUlRkRks1ank4VUlDCmlPMDhVUEZvcG15YU9BZy80NjNER28yam44a0hpNUJrNGVQRWpnSHljcjk5aG1ObHNvMFpZUHpmYTNTVUtQMmVSa2VKMHU5cGRKUW8KZmQyd0c0Mk9FcVZQTzk1LzNmRFNweDN2bnpVNlNzU0hpRGZkRlhmL1RWUHVlL0s1cmo5VHBmMUQxZDZzUHdBKzRmY1BwWnpoa2ZySAovejlPb0JQb0JEcUJUcUFUNkFRNmdVNmdFK2dFT29GT29CUG9CUHF6Z0Y3L1VrdVAvOVNxTGYzSEh2ZitkMWpPNlJlRUM2cHZUbkRQCkpRQUFnQUJKUkVGVWVOcnNuWGVjSFVlUitLdXF1MmZtcGMxQjBpb0hXN0lzUjNET1lFd3dPWVBKOFk2Y0RFY09KdDRSamdQc0h4emgKeUJrTXhnWnNnc0ZnbStTY1pDdnZyclE1dkRRejNWMzErK1B0cmxiSldFYXlKR3Urbi8yc250NmJuWm5YTTFQVlhSRVZkZ01BQUlFUQpBRTI5M2pPSU9QTmFST0Nmd3c5Z200ZVNQWDI3ZyswODkvYjg5eFg3YWh6MjlqejM5cmo3NmpydXEvSGMwM0gzL1hudS9UTjRNSE9vClBIZjdpbjMxWER6NCt4YW5BUUI5b0ljakl5TWpJK09oWTJiU2dJaVpBc2pJeU1nNHZKalJBUTkrSFhIb3J6MHpNZzVKc2tjdjQxOUgKUkpoNXIxY0EyYzJYa1hIQXlSN0RqSDNDL3ZZb1ptUmtaR1FjcEdRS0lDTWpJK013SlZNQUdSa1pHWWNwR2lUWTVjMUc1T24ranVNKwpVQndxNTNtb24vLytQczlEWmYrSHl2VjZ1Sjcvd2NiQmRWOWxLNENNakl5TXc1Uk1BV1JrWkdRY3BtUUtJQ01qSStNd0pWTUFHUmtaCkdZY3BtUUxJeU1qSU9FekpGRUJHUmtiR1lVcW1BREl5TWpJT1V6UmdDZ0FQdkIvQW5qblU2K3dmS21Uam5ER2JnNjJQd3Y3dXg1RGQKNS91U2JBV1FrWkdSY1ppU0tZQ01qSXlNdzVSTUFXUmtaR1FjcG1RS0lDTWpJK013SlZNQUdSa1pHWWNwbVFMSXlNaklPRXpKRkVCRwpSa2JHWWNwZTl3VGVNMWw4YnNhaHlLRnkzeDVjZGVTemVQK0hCOWtLSUNNakkrTXdKVk1BR1JrWkdZY3BtUUxJeU1qSU9FekpGRUJHClJrYkdZVXFtQURJeU1qSU9VeklGa0pHUmtYR1lraW1Bakl5TWpNT1UrOGtEeU9Kd0QwNnk2NUp4TUpQTktROGxzcXVWa1pHUmNaaVMKS1lDTWpJeU13NVJNQVdSa1pHUWNwbVFLSUNNakkrTXdKVk1BR1JrWkdZY3BtUUxJeU1qSU9FekpGRUJHUmtiR1ljcUQ2QWV3SjUyUgp4YWRuWkdRY0ttUnk3UDVHSVNNakl5UGpZVTZtQURJeU1qSU9VeklGa0pHUmtYR1lraW1Bakl5TWpNT1VUQUZrWkdSa0hLWmtDaUFqCkl5UGpNQ1ZUQUJrWkdSbUhLUThpRHlEai90bGJuWHA0eFIxblBOdzVWTzduZlhXZWg4YnpMbUQzeWRsblpHUmtaRHhNeUJSQVJrWkcKeG1GS3BnQXlNakl5RGxNeUJaQ1JrWkZ4bUpJcGdJeU1qSXpEbEV3QlpHUmtaQnltWkFvZ0l5TWo0ekRsUWVRQkhDcHh2Z2VLUFkxUApwbXNQTEZuOTk0eUhra1BqdnNxa1VrWkdSc1poU3FZQU1qSXlNZzVUTWdXUWtaR1JjWmlTS1lDTWpJeU13NVJNQVdSa1pHUWNwbVFLCklDTWpJK013SlZNQUdSa1pHWWNwV1QrQWg0eERJeTU0MzdHdjVoWjdPMjU3ZTl3c1ArQ2hZWCtQYzNZZEFmWmM5MzlQWkN1QWpJeU0Kak1PVVRBRmtaR1JrSEtaa0NpQWpJeVBqTUNWVEFCa1pHUm1IS1prQ3lNakl5RGhNeVJSQVJrWkd4bUZLcGdBeU1qSXlEbE1leG5rQQpCMXNjK3Y2T1p6OVV6bk52T1ZEeDNRZHEvUGZWL2c4VSsrcCt5T2FtRHdZRXMxZmJaNk9ja1pHUmNaaVNLWUNNakl5TXc1Uk1BV1JrClpHUWNwbVFLSUNNakkrTXdKVk1BR1JrWkdZY3BtUUxJeU1qSU9FekpGRUJHUmtiR1ljckRPQTlnYjlsWGNkWUgyMzRPMUhrZXFEeU0KQTVYSGNLRHlJZmJWT0J4czdPLzdhbjl6YUZ5dlEyVTBNekl5TWpMMk1aa0N5TWpJeURoTXlSUkFSa1pHeG1GS3BnQXlNakl5RGxNeQpCWkNSa1pGeG1KSXBnSXlNakl6RGxDd01OQ05qTnlEaWJ0OFhrUU45YWhrWis0eUhzUUk0MU9PZ0gvNEl5S3pYUUlDSUFzQXNERUFBCmhJQU16aWhqdlNjZ0ltSm1SQ1VpSHNxQVNFVHNQUUFoVVVOa280OW03eFpoU281N2tCMk9QSTBDaDRnaUtDQ0VHb0ZFQkZGWlViTjMKZ29naUlpQ0dVdWFwVzR1QkF4MVlaMmVPMGpnMElTRWlNd3ZJekVlSERYc2J2MytnK2owY0tBNnU3L1V3VmdBWkJ6c040ZGdRM0VUawpmTXJpQ1lpUVdCZ0JpUlFDT3A4S3NBZGdWZ2pJNGdCQVlRY0xzeGNBVUtnUWtEMHpPSUF5QUFCTzdabTNUOWkzQytMWnMzdlBHZ1FRCkFVUUpJa3REYWd0Z01yT05pQWd3RUNLaTg2SlFpUWdpa29CMUNZTTNGRFFrUGdJZ29tZkh3Z1NnbGZiK1FJOXlSc2FleVJSQXhrTksKWXlvTjA1TmxoS24vZW04QnVESFhSa1FDemNLZVBRQUxpRkZHUkR4N0FVQkFJbktjQWlBaUVaSDNEb1FCU0d2RG5CY1JFWmxscmNHWgpnemFZYmNVaFpaaFp4QU93bDhic2pFVVFnTGRQMXBCQnBMRS9CVGtpc3Q2S0NBSnEwaVRFekFETXdBU0VTSVFBQWdqb3ZOdmJEazBaCkdROGxxTEFiQUFBSWhLYVhZNDNmQjlkU0plTlE0NEhHRjB4ckFpRWlFV25Nd1FrME5PeENpQ3lNRGRNS0FUTURzb2lBWVFCZ213QWkKSUtOU0lnemVnN1FDNEs2R2w4YXNmMWNMdmdCRHc1WkVBQUJUeXd1bGZJb0NBbzFQY1VxakFEQ0NKcUNHNXJIZUVwRFcyanBMeUkxbApRY09hcEVnUmtYUHV3TVZaSEd6UDc3NHFqWEN3bFZnNDJNNW43OGhXQUJrSGhoazdUR01SSUFETWdFZ0lpTnVGTGlPRVJvSDNuc0VECm9BZHJTQkZSWWlkSmF4M29YQzVpY1NKZWF4TUVRUzRvTnRZUWpVTTBKRFVpY3VNb0lpTEN6TXpjVUFZSVVacW1hWnBPZjRUZWUyYVAKT2hRUmtTblhnb0FIQUNKQ2xzYjAzNGpSUkk2ZGMweUlMQUNBQ0JvUldMeG5ZUllHek1Mc01nNW1zaFZBeG43aW40dSsyZDVhUXZEaQpvV0hRUi9Sc0FaZ0lTRUpTRUFSYWE4b1hRaEVmUm9ZSWlVcEpVaDhjSEVqU09rdUNpSWpDYkFFU21ISUI3R0RxQWRxRE01WngrbXdSCmdBQ1UxZ0VpZG5WMks2VzAxb2hvclkvajJGb3JnbkUxYlpqN0U1OFlOQ0xDd0pvMFlPaThFeENGcHFHOVdCb2U0QU1WTlhTd1BiL1oKQ3VDaE9aKzlJMU1BR2Z1SlBUNFlNOWFZR1RjQUlyTFVsRktOT2J0U0ZPVjBvUmlGb2ZHV0J3YTJzcmc0cVRiczhrZ2dBaWdFd0ZyVApVVWNkMmR4U0lJTG1sbUpQVDgrY09YUENNTXpuOC9sOFBneERwVlREdUJNRWdmZmVPWmRPNDV4ajVtcHRkR3hzWW5Sa29seXUxNnJKCjJHaTV0M2RyZjk4MlR3MTlOSTBRQUNFcGpXRVFCSjJkblkzZHBtbGFyOWVkYzNHc0VORjc4ZDRUYWdCZ2FYaTVNeE5RZzB3QlBEVG4KczNka0NpQmpQN0g3QjZNUkdUbGoveUVpcmJWU0tzcmJRcUVFd0tPam81UGxNUUFMNkJyUm0waHd5aW1QbUw5Z3p2ejVjNWN1VzlqZQozdHJVWE1vSFNWTlRVeGpwenM1V3BTVUlsVktvRkNLMDBuUklhSU9HVWhHZ3h0RWJXbWZhVVF3K1RVVkFXSGxIM2ludktJNXRwVndiCnJZNGxTWklrYWJXU0RBMk5iTnJZdTJIRHBwR1JrZEhoc1Z0dXVZV1psVkxlZTVpMlZobmQwZFhWRlVWUnJSb25TV3F0VFZQbm5BTUoKRHRENEgyelBiNllBSHByejJUc3lCZkN3WWIvZmlBM1p6Y0FJcU1oNDlnZ29KTXdwYWNYT0FpRG9BRVNBcCtmMXpFU2dGQXA0RVNmZwpBZktFdmxESUI1cWFtb3JBYW5ob3BGeXRNSlJOUURaTkFOMkpqMXl6NXBpVnh4eHo5T0lsODVzS3VhN3V0dTQ1YlVFa3BKeldxQlFLCkNFS1kyalEwbXNIRmFTME1BdWNkRVZIU2hJak91VEFNYmVxSUF2YkFMQWJSK1RqS0tjZDFVbWl0WlVBQU1xUUFBRkVBUmFRaDBJV0kKbEFwQkVNa0FHR0J3bHAxamEvMWtncE1UNWRIUnljbUordmhZZGN2bXJYZmVjZS9HalpzM2IxMi9ZZjE2WUFCbHdERW8xZFRVMHRYVgpsVlJkSEx2SlN0MHpNRHNXVmpySFRJclIrWlNBTkdsaG52Rjh4RmdCd2FubkVSWEFsQ1ZMN1RHZklIdE9NLzQ1QW5hMzcyY0s0R0hECi9sVUFST1RZTlF6MGpSUW5BRktrTERNQUl3S1FKd0x2VXRBYVJJZ05JakpQVFpDSklKZkxCWUV1TmtPU0pBUDlBd0RlYUdWZHpXZysKKyt5elRuamttaFVybGk5WnVxQ3R2VFIzWGpzcGlYSXFDRFNJdFM1cEJPRllhMFZBcXdCUk9VK0JpZExVSWFvb3pIa3ZDQW9Sa1VlWQoyUmpERElpSzBLUUpHeE1RQ0FBTHBBSUpzMU5LTVFNekVMR0lBRGFXQlo3WkFUSVJlU2VOUFNCb1JLVW8xTm9nSWhNU0VZSWhNaUJhCldLV3B0ZGFQbCtOMTZ6YkU5ZlRXVzIrLzQ0NDdOMjdZZk9PTk55YUpCVFFnRkFTRnp1NDVXdXZ4aVhLOWJyMFF1UWdSdmZmQzFpamoKZktwUWViRWVIUUFoQmlCS1JBQVpoQkdGNUhCTG1NcllsMlFLNEdIUC9sVUFpT2pFYWRTSTZObkRkQm9YVXlvTVJJclpheDA2NTVDMApzRmRnR0RnWFJvaSt2YU01alBUR2pmZFpWd2VxZzhBSko2dzU5N3pUVHp4eGRXZFhjWDVQVzBkbmsxRlJFR2hTa0NRMVFCY25WU1R2CnZTWERXZ1ZlS0FqeUN2UHNGVWhnVXc1eTJudFdGRElEVFFFaVhsUE5XZFk2OEE2VjBzNDJSZ2JSc1FtSUpkR0c0N2hHUk02eFFrM0sKTXpPaUlLS0E5OTdDZEVBcVRNV0hhbTQ0cHhIWmd3NVNJZ0pBRVJSdVJCbHBSUFRTWkV3ZVFJUWhUZHpFUkhsb2FHUjRlUGplZGR0KwovYXZmWGZ1SEd3WUhod0VRVUFWaGFkN2N4YW10akk2T3g3VWtDUE5wNGdrampScUFVcWdBQTBBRTBFaEZkZ0F4b3RBZVRVblpjNXJ4Cno4a1V3TU9lL2FzQVpxb2FOR3pvaXBTSWVQRUNDYUlCSUVXaDg2blJlZXZxWVpBcjVPdFJGSW40Z2NHdExBN0F6NXMzNThsUGZ1SVoKWjUyd1lzWENlVDJ0dVp3M1lacVBxRnFmakpPYWRvYkZpWWozM2hoTlJFR2dSU1NCSkZjb3huVW5US1J6Q0NHU1VjcFkzcVoxaUdBQQowSHN2d2tSQWlpRnUxaW9DVU94SnF4QVJuV01SaVVJVkoxWFBjUlFBRWdPTHRRNkZCRzFqb2swRUl1eTliNndBQUJ3QUlDb2lQUzNvCmxZZ1lzbzFBMG9hZWFLeHZ2UGNlOGxwcjlpQ0NSa2RFdW1IQUVXeXJWdUs0THJmY2R0YzlkOS83K3ovODRjYy92RkpBTWRSQW9LTnIKdnJBUjF1WEoyRm9oMUN3SmdERXE3ejB3T0FBUEVLTVM4dUUrdVk0Wmh5ZVpBbmpZczk4VlFFUG9zekFoQVV6bFBTbktBd0F6czNBVQptVERDZkVFaDhaWXRkeG1qclBPbm5IYlVjNTc3MUpWSExWcXdzR3ZPM0k1aUZLYTJIaWRsOW9tM3NZaWdRQlRtMk5ZUVVTa0RvcFF5CjdBRlJJWklZUXEyU09BMmlVRWc1NzczM1Npa2R4alpsaEZDckhJakpCOFhHOTBIT0l5cG5LVEM1V2kwR1lCTW9yWldYU1FJSGt0WnIKNDFHb3ZIVkVXcHdJMmFuSlBvRklZd1VBcEFCeEptdHNxbEtGSW9PSTJ1TlVrQ2t3SUUrTkRRQkQ2SndMb3B3NFlRYWxUQktueGhpdgpVS3U4c0NaVFlPL2l4SStPVjIrOTVjNTc3aHIrOFk5L2ZOMmYvZ1NJaExwN1hrOWdvdkh4Y1U1VlBYSGVLU0tEaU00bkFBbHFJQmZ0CmsrdVljWGlTS1lDSFBmdmJDVXlJeU9JYTB0K0pJeUN0dElEWEtnaUNvTG1sNUh5MWYrdDlTbHZQOEtRTEgzM2VvODQrZXMyeTVVZk0KYmV2VWxzZEkxMnYxTWZMRW5nS1ZjNm1LZ29KTG1JaTg5MXJId2dpQXdrcnJrRkFEYUsxMUtvS0lvTFEyWVMySlRhaU5NVVNvdUtkYwpya1pSSG9RR0JvWTNidWoxbmhGVW5BemR1M2I5d01DSVZtRkxTN09BcmNlVGl4YjN0SFJDWCsvR1p6NzlTVTJsMEtkMW8zUmNyWVVtCmNqemwrRzFJY3hIZm1ObzNLcjQxVEV0VHFrNHBBSURVRU5HMGZ1Q3B2d1VRaUpBMGUwOUtDWXVJVUJoS21yS1pWQ29Ib0pMRWtsTEcKNUFVVWduRnA5OFI0K1o1N04venRiMysvNGhlL3V1YnEzeU1aWmo5blRnK1JydGRjUFhFMjlWNllDTmlsQ29yNzZEcG1ISTVrQ3VCaAp6MzVYQUkzU0NJUWs0b25JQk1wYTJ6MHZRTVF0bTdjQWVFQys4RWxuWEhEQjZXdU9QV0xwc3VZd0RNTXd0TlphbXhBQktTQkN0cE5FCkJqa0lUSzVlVFVOdEdsbkFLY2RFcEZYQURONTdJbzFBeGhpa2dCbUpjbUd1eWJKS3JkeTNidE8yYmR2VzNWWDcyTWMrNG54eTFGRXIKZ3lENHpXOStCNkpZQURDSndpQ09IYUZtU1UwQXIzL2p5ODQrNTdUVngzWUhvU3JsZEwwK0ZpcFVBZ1RLSmFsUVNFUkkwcERqUkVnSwpFSkV3bE9sRUFHWlBSRk5wQ3J6ZEZET1QwTURNUkFZQUdza0';

    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: Qtware | null;
    private _publicKey: PublicKey | null;
    private _network: WalletAdapterNetwork;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    // m17 vanilla: WalletAdapterNetwork.Mainnet
    constructor({ network = WalletAdapterNetwork.MainnetMln }: QtwareWalletAdapterConfig = {}) {
        super();
        this._network = network;
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (typeof window.qtware?.postMessage === 'function') {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.connected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable && this._readyState !== WalletReadyState.Installed)
                throw new WalletNotReadyError();

            this._connecting = true;

            let QtwareClass: typeof Qtware;
            try {
                QtwareClass = (await import('qtware-adapter-sdk')).default;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: Qtware;
            try {
                wallet = new QtwareClass({ network: this._network });
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            if (!wallet.connected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return await wallet.signMessage(message, 'utf8');
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
